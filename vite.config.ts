import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";
import path from "path";

/**
 * Get actually used dependencies by cross-referencing imports with package.json
 * @returns {string[]} Array of package names that are actually used
 */
function getActuallyUsedDependencies() {
  try {
    // 1. Read package.json to get all available dependencies
    const packageJsonPath = path.resolve("./package.json");
    if (!fs.existsSync(packageJsonPath)) {
      console.warn("package.json not found, skipping dependency analysis");
      return [];
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const availableDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Get just the package names
    const availablePackageNames: string[] = Object.keys(availableDependencies);

    // 2. Scan code to find imports
    const importedPackages: string[] = findImportedPackages();

    // 3. Cross-reference imports with package.json
    const usedDependencies = [];

    // For each imported package, check if it's in package.json
    for (const importedPackage of importedPackages) {
      // For exact matches
      if (availablePackageNames.includes(importedPackage)) {
        usedDependencies.push(importedPackage);
        continue;
      }

      // For scoped packages, we need to check if any available package
      // starts with the imported package name plus "/"
      if (importedPackage.startsWith("@")) {
        const matchingPackages = availablePackageNames.filter(
          (pkgName) =>
            pkgName.startsWith(importedPackage + "/") ||
            pkgName === importedPackage
        );
        usedDependencies.push(...matchingPackages);
        continue;
      }

      // For regular packages, check if any available package
      // starts with the imported package name plus "/"
      const matchingPackages = availablePackageNames.filter(
        (pkgName) =>
          pkgName === importedPackage ||
          pkgName.startsWith(`${importedPackage}/`)
      );
      usedDependencies.push(...matchingPackages);
    }

    // Remove duplicates
    const uniqueUsedDependencies = [...new Set(usedDependencies)];
    return uniqueUsedDependencies;
  } catch (error) {
    console.error("Error analyzing dependencies:", error);
    return [];
  }
}

/**
 * Find imported packages by scanning source files
 * @returns {string[]} Array of package names imported in source files
 */
function findImportedPackages(): string[] {
  const importedPackages = new Set();
  const appDir = path.resolve("./app");

  // Only scan if the app directory exists
  if (!fs.existsSync(appDir)) {
    console.warn("App directory not found, skipping import scan");
    return [];
  }

  /**
   * Recursively scan directory for JS/TS files and extract imports
   * @param {string} dir Directory to scan
   */
  function scanDirectory(dir: string) {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          scanDirectory(fullPath);
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
          // Read and analyze JS/TS files
          try {
            const content = fs.readFileSync(fullPath, "utf-8");

            // Match import statements
            const importRegex = /from\s+['"]([^./][^'"]*)['"]/g;
            let match;

            while ((match = importRegex.exec(content)) !== null) {
              const fullPackage = match[1];

              // Handle scoped packages like @radix-ui/react-label
              if (fullPackage.startsWith("@")) {
                // For scoped packages, extract scope and package name
                const parts = fullPackage.split("/");
                if (parts.length > 1) {
                  importedPackages.add(`${parts[0]}`); // Just the scope part
                  importedPackages.add(`${parts[0]}/${parts[1]}`); // Scope + first level
                } else {
                  importedPackages.add(fullPackage);
                }
              } else {
                // For regular packages, just use the first part
                const packageName = fullPackage.split("/")[0];
                if (packageName && !packageName.startsWith(".")) {
                  importedPackages.add(packageName);
                }
              }
            }

            // Also check for require statements
            const requireRegex = /require\(['"]([^./][^'"]*)['"]\)/g;
            while ((match = requireRegex.exec(content)) !== null) {
              const fullPackage = match[1];

              // Handle scoped packages like @radix-ui/react-label
              if (fullPackage.startsWith("@")) {
                // For scoped packages, extract scope and package name
                const parts = fullPackage.split("/");
                if (parts.length > 1) {
                  importedPackages.add(`${parts[0]}`); // Just the scope part
                  importedPackages.add(`${parts[0]}/${parts[1]}`); // Scope + first level
                } else {
                  importedPackages.add(fullPackage);
                }
              } else {
                // For regular packages, just use the first part
                const packageName = fullPackage.split("/")[0];
                if (packageName && !packageName.startsWith(".")) {
                  importedPackages.add(packageName);
                }
              }
            }
          } catch (err) {
            console.error(`Error reading file ${fullPath}:`, err);
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning directory ${dir}:`, err);
    }
  }

  // Start scan from the app directory
  scanDirectory(appDir);

  // Convert Set to Array
  return Array.from(importedPackages) as string[];
}

function errorParserPlugin(): Plugin {
  return {
    name: "vite-error-parser",
    async buildEnd(err) {
      if (err) {
        // err may be an Error, a RollupError, or an array thereof
        const errors = Array.isArray(err) ? err : [err];
        const parsed = errors.map((e) => {
          const message = e.message;
          const stack = e.stack ? e.stack.split("\n").slice(0, 5) : [];
          return { message, stack };
        });
        // Do whatever you want with parsed
        console.error("<<<BUILD_ERROR_STARTS_HERE>>>");
        console.error(parsed);
        console.error("<<<BUILD_ERROR_ENDS_HERE>>>");
        // You could also write them to a file, throw a custom error, etc.
      }
    },
  };
}

// Known problematic packages to always exclude
const ALWAYS_EXCLUDE: string[] = [
  // TypeScript types
  "@types/react",
  "@types/react-dom",
  // ESLint and plugins
  "eslint",
  "eslint-plugin-import",
  "eslint-plugin-react",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-react-hooks",
  // Build tools
  "typescript",
  "vite",
  "esbuild",
  "rollup",
  // Node built-ins and remix-specific
  "node:stream",
  "@remix-run/dev",
  "@remix-run/eslint-config",
  "@remix-run/serve",
];

// Core dependencies we always want to optimize
const CORE_DEPENDENCIES: string[] = ["clsx", "tailwind-merge"];

// Get dependencies that are actually used (cross-referenced with package.json)
const usedDependencies = getActuallyUsedDependencies();

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
      "@": path.resolve(__dirname, "./app"),
    },
  },
  plugins: [
    errorParserPlugin(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],

  // Optimize only packages that are actually used and in package.json
  optimizeDeps: {
    include: [
      ...CORE_DEPENDENCIES,
      ...usedDependencies.filter(
        (dep: string) =>
          !ALWAYS_EXCLUDE.includes(dep) && !CORE_DEPENDENCIES.includes(dep)
      ),
    ],
    exclude: ALWAYS_EXCLUDE,
    // Force Vite to re-bundle on server restart in development
    force: process.env.NODE_ENV === "development",
  },

  build: {
    // Ensure all asset URLs are relative
    assetsDir: "assets",
    // Optimize chunking for production
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Group node_modules into chunks by top-level package name
          if (id.includes("node_modules")) {
            const parts = id.split("node_modules/");
            const packageName = parts[parts.length - 1].split("/")[0];

            // Large libraries get their own chunk
            const largeLibraries = [...CORE_DEPENDENCIES];
            if (largeLibraries.includes(packageName)) {
              return `vendor_${packageName}`;
            }

            // Group smaller libraries
            return "vendor";
          }
        },
      },
    },
  },

  // Enable minification in all modes for better performance
  esbuild: {
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },

  server: {
    host: true,
    allowedHosts: true,
  },
});
