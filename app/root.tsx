import { type LinksFunction } from "@remix-run/node";
import { Links, Outlet, Scripts, useRouteError } from "@remix-run/react";
import { DefaultNotFoundRoute, DefaultErrorRoute } from "~/components/sections/not-found-page";

import "./tailwind.css";

export const links: LinksFunction = () => [];

export function ErrorBoundary() {
  const error = useRouteError();
  
  const isNotFound = error instanceof Response && error.status === 404;
  
  if (isNotFound) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Links />
          <title>Page Not Found</title>
        </head>
        <body>
          <DefaultNotFoundRoute />
          <Scripts />
        </body>
      </html>
    );
  }

  // Server error (500, etc.) - Extract detailed error information
  let errorDetails = 'An unexpected error occurred';
  
  if (error instanceof Error) {
    // Standard Error object
    errorDetails = error.message;
    if (error.stack) {
      errorDetails += '\n\nStack trace:\n' + error.stack;
    }
  } else if (error && typeof error === 'object') {
    // Remix Response errors or other objects
    if ('data' in error && error.data) {
      errorDetails = typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2);
    } else if ('message' in error) {
      errorDetails = String(error.message);
    } else {
      errorDetails = JSON.stringify(error, null, 2);
    }
  } else if (typeof error === 'string') {
    errorDetails = error;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
        <title>Server Error</title>
      </head>
      <body>
        <DefaultErrorRoute errorDetails={errorDetails} />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {

  return (
    <html
      lang="en"
      style={{
        height: "100%",
      }}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <Links />
      </head>
      <body>
        <main className="min-h-screen p-6">
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}
