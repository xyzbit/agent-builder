/**
 * Optimized client entry point for immediate interactivity
 */

import { RemixBrowser } from "@remix-run/react";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

// Immediate hydration for quick interactivity
hydrateRoot(
  document,
  <StrictMode>
    <RemixBrowser />
  </StrictMode>
);