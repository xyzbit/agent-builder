import { DefaultNotFoundRoute } from "~/components/sections/not-found-page";

// Catch-all route for any unmatched URLs
// This ensures 404s are handled properly instead of showing router errors
export default function CatchAllRoute() {
  return <DefaultNotFoundRoute />;
}