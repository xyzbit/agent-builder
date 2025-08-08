// @ts-nocheck
import fs from "node:fs";;
import path from "path";
import { fileURLToPath } from 'url';
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import type { JSXFragment, JSXText, ReturnStatement } from "@babel/types";
import postcss from "postcss";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function scanAndModifyFiles(directory: string): void {
  // Pattern to match <tarsAction type="file" filePath="...">
  const tarsActionPattern = /<tarsAction\s+type="file"\s+filePath="([^"]+)">/;

  // Recursively scan directory for files
  function scanDirectory(dir: string): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Exclude node_modules and .git directories
        if (!file.includes('node_modules') && !file.includes('.git')) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        // Read file content
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');

          // Check if file contains the pattern
          const match = content.match(tarsActionPattern);
          if (match) {
            // Find the position of the pattern
            const patternIndex = content.indexOf(match[0]);

            if (patternIndex !== -1) {
              // Remove everything from the beginning of the file till this pattern
              const patternEndIndex = patternIndex + match[0].length;
              const modifiedContent = content.substring(patternEndIndex);

              // Write back to file
              fs.writeFileSync(fullPath, modifiedContent, 'utf-8');
              console.log(`Modified file: ${fullPath}`);
            }
          }
        } catch (error) {
          console.error(`Error processing file ${fullPath}:`, error);
        }
      }
    }
  }

  scanDirectory(directory);
}

// Execute the scan and modify function on the app directory
const appDirectory = path.resolve(__dirname, "../app");
scanAndModifyFiles(appDirectory);

// Adjust this path to where your Remix index file is located
const filePath = path.resolve(__dirname, "../app/routes/_index.tsx");
const code = fs.readFileSync(filePath, "utf-8");
const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});
let isEmptyComponent = false;
traverse.default(ast, {
  FunctionDeclaration(path) {
    if (path.node.id?.name === "Index") {
      path.traverse({
        ReturnStatement(returnPath) {
          const argument = (returnPath.node as ReturnStatement).argument;
          if (argument?.type === "JSXFragment") {
            const fragment = argument as JSXFragment;
            const children = fragment.children;
            const hasVisibleChildren = children.some((child) => {
              return !(
                child.type === "JSXText" &&
                (child as JSXText).value.trim() === ""
              );
            });
            if (!hasVisibleChildren) {
              isEmptyComponent = true;
            }
          }
        },
      });
    }
  },
});
if (isEmptyComponent) {
  throw new Error("routes/_index.tsx returns an empty component, please build the home page.");
}

// --- New Check for Tailwind CSS @apply usage ---
// Adjust this path to the location of your tailwind.css file
const tailwindCSSPath = path.resolve(__dirname, "../app/tailwind.css");
if (fs.existsSync(tailwindCSSPath)) {
  const tailwindCSS = fs.readFileSync(tailwindCSSPath, "utf-8");
  // First validate the CSS using PostCSS
  try {
    postcss.parse(tailwindCSS, { from: tailwindCSSPath });
  } catch (error) {
    throw new Error(`Invalid CSS file at ${tailwindCSSPath}: ${error.message}`);
  }
  // Regex to capture all @apply rules and the classes that are applied.
  const applyRegex = /@apply\s+([^;]+);/g;
  let match;
  let matchingClasses = [];
  while ((match = applyRegex.exec(tailwindCSS)) !== null) {
    // Split the list of classes by any whitespace.
    const classes = match[1].trim().split(/\s+/);
    // Check each class that starts with "font-" - allow standard font classes
    const allowedFontClasses = [
      'font-inter', 'font-display', 'font-body', 'font-custom',
      'font-bold', 'font-medium', 'font-semibold', 'font-light', 'font-normal',
      'font-thin', 'font-extralight', 'font-extrabold', 'font-black', 'font-sans', 'font-serif', 'font-mono'
    ];
    
    for (const className of classes) {
      if (/^font-/.test(className) && !allowedFontClasses.includes(className)) {
        matchingClasses.push(className);
      }
    }
  }

  // Make matchingClasses unique
  const uniqueMatchingClasses = Array.from(new Set(matchingClasses));

  if (uniqueMatchingClasses.length > 0) {
    throw new Error(
      "tailwind.css uses unsupported font classes with @apply. Please use only allowed font classes. \n\n" +
      "Unsupported classes found: " + uniqueMatchingClasses.join(", ") + "\n\n" +
      "Allowed font classes: font-inter, font-display, font-body, font-custom, font-bold, font-medium, font-semibold, font-light, font-normal, font-thin, font-extralight, font-extrabold, font-black"
    );
  }
}

// --- New Check for SelectItem with empty string value ---
function fixEmptySelectItems(directory: string): void {
  // Regular expression to match SelectItem with empty value
  const emptySelectItemPattern = /SelectItem\s+value=""/g;
  const modifiedFiles: string[] = [];

  function scanAndFixEmptySelectItems(dir: string): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, and _data directories
        if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('_data')) {
          scanAndFixEmptySelectItems(fullPath);
        }
      } else if (stat.isFile()) {
        // Focus on JSX/TSX files that might contain UI components
        if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.ts')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');

            // Check if file contains the pattern
            if (emptySelectItemPattern.test(content)) {
              // Reset the regex lastIndex to start search from the beginning
              emptySelectItemPattern.lastIndex = 0;
              
              // Replace all occurrences of empty SelectItem values
              const updatedContent = content.replace(emptySelectItemPattern, 'SelectItem value="all"');
              
              // Write the updated content back to the file
              fs.writeFileSync(fullPath, updatedContent, 'utf-8');
              
              // Add the file to the list of modified files
              modifiedFiles.push(fullPath);
            }
          } catch (error) {
            console.error(`Error processing file ${fullPath}:`, error);
          }
        }
      }
    }
  }

  scanAndFixEmptySelectItems(directory);
}

// Execute all checks
const projectDirectory = path.resolve(__dirname, "..");
fixEmptySelectItems(projectDirectory);
