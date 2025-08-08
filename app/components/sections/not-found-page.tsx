import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";

// Optional AI Integration Handler (only works if TARS is available)
const handleTarsMessage = (message: string) => {
  try {
    // Try to send message to TARS chat system if available
    if (typeof window !== 'undefined' && (window as any).__TARS_SEND_MESSAGE__) {
      (window as any).__TARS_SEND_MESSAGE__(message);
    } else {
      // Standard fallback - just log the message
      console.log('TARS not available. Message:', message);
    }
  } catch (error) {
    console.warn('TARS integration not available:', error);
  }
};

interface NotFoundPageProps {
  errorType?: "404" | "500";
  variant?: "default" | "minimal" | "friendly" | "professional";
  title?: string;
  message?: string;
  errorDetails?: string;
  showSearch?: boolean;
  showAiButtons?: boolean;
  customActions?: React.ReactNode;
  className?: string;
}

export function NotFoundPage({
  errorType = "404",
  variant = "default",
  title,
  message,
  errorDetails,
  showSearch = false,
  showAiButtons = false,
  customActions,
  className
}: NotFoundPageProps) {
  const get404Config = () => ({
    default: {
      container: "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100",
      card: "bg-white/80 backdrop-blur-sm",
      title: title || "Page Missing",
      message: message || "It looks like this page was missed during the development process. Please write a message in AI chat box asking to build this page by mentioning URL or name of the page with details.",
      icon: "🔍"
    },
    minimal: {
      container: "min-h-screen bg-white",
      card: "bg-transparent border-0 shadow-none",
      title: title || "404",
      message: message || "Page not built yet. Ask AI to create this page by providing the URL and desired functionality.",
      icon: "404"
    },
    friendly: {
      container: "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50",
      card: "bg-white/90 backdrop-blur-sm",
      title: title || "Oops! Page Missing",
      message: message || "It looks like this page was missed during development! Please ask AI to build this page by sharing the URL and what you want it to do.",
      icon: "🚀"
    },
    professional: {
      container: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100",
      card: "bg-white border-gray-200",
      title: title || "Page Not Developed",
      message: message || "This page was not included in the current development cycle. Please request page creation through AI chat by specifying the URL and required functionality.",
      icon: "⚠️"
    }
  });

  const get500Config = () => ({
    default: {
      container: "min-h-screen bg-gradient-to-br from-red-50 to-orange-50",
      card: "bg-white/80 backdrop-blur-sm",
      title: title || "Development Error",
      message: message || "Oops! Something has gone wrong during development. Please help me fix the issue by copying and pasting this error in AI chat.",
      icon: "🔥"
    },
    minimal: {
      container: "min-h-screen bg-white",
      card: "bg-transparent border-0 shadow-none",
      title: title || "500",
      message: message || "Development error occurred. Please share this error with AI to get help fixing it.",
      icon: "500"
    },
    friendly: {
      container: "min-h-screen bg-gradient-to-br from-red-50 to-pink-50",
      card: "bg-white/90 backdrop-blur-sm",
      title: title || "Oops! Something Broke",
      message: message || "Something went wrong during development! Copy this error message and paste it in AI chat for help fixing it.",
      icon: "🤖"
    },
    professional: {
      container: "min-h-screen bg-gradient-to-br from-gray-50 to-red-50",
      card: "bg-white border-red-200",
      title: title || "Development Issue",
      message: message || "A development error has occurred. Please copy and paste this error in AI chat to get assistance with debugging and fixing the issue.",
      icon: "⚠️"
    }
  });

  const variants = errorType === "500" ? get500Config() : get404Config();

  const config = variants[variant];

  return (
    <div className={cn(config.container, "flex items-center justify-center p-4", className)}>
      <Card className={cn(config.card, "max-w-md w-full")}>
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon/Visual */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <div className="text-3xl">{config.icon}</div>
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {config.title}
            </h1>
            <p className="text-gray-600 leading-relaxed">
              {config.message}
            </p>
          </div>
          
          {/* Search Box (Optional) */}
          {showSearch && (
            <div className="relative">
              {safeLucideIcon("Search", "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400")}
              <input
                type="text"
                placeholder="Search for pages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Handle search functionality
                    console.log('Search:', e.currentTarget.value);
                  }
                }}
              />
            </div>
          )}

          {/* Error Details (for 500 errors) */}
          {errorType === "500" && errorDetails && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
              <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">
                {errorDetails}
              </pre>
            </div>
          )}

          {/* AI Actions (Optional - only shown when TARS is available) */}
          {showAiButtons && (
            <div className="space-y-3">
              {errorType === "404" ? (
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const currentPath = window.location.pathname;
                    const message = `Please generate a page for the route '${currentPath}'. The user tried to access this page but it doesn't exist yet.`;
                    handleTarsMessage(message);
                  }}
                >
                  {safeLucideIcon("Sparkles", "mr-2 h-4 w-4")}
                  Build This Page
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const currentPath = window.location.pathname;
                    const message = `Development error encountered on route '${currentPath}'. Error details: ${errorDetails || 'No specific details available'}. Please help me debug and fix this issue.`;
                    handleTarsMessage(message);
                  }}
                >
                  {safeLucideIcon("Bug", "mr-2 h-4 w-4")}
                  Get Help Fixing This
                </Button>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="space-y-3">
            {customActions || (
              <>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
                  asChild
                >
                  <a href="/">
                    {safeLucideIcon("Home", "mr-2 h-4 w-4")}
                    Back to Home
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.history.back()}
                >
                  {safeLucideIcon("ArrowLeft", "mr-2 h-4 w-4")}
                  Go Back
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Pre-built 404 route component (clean, no AI dependencies)
export function DefaultNotFoundRoute() {
  return (
    <NotFoundPage
      errorType="404"
      variant="friendly"
      showSearch={true}
      showAiButtons={false}
    />
  );
}

// Pre-built 500 error route component (clean, no AI dependencies)
export function DefaultErrorRoute({ errorDetails }: { errorDetails?: string }) {
  return (
    <NotFoundPage
      errorType="500"
      variant="professional"
      errorDetails={errorDetails}
      showAiButtons={false}
    />
  );
}

// TARS-enabled versions (for when AI features are desired)
export function TarsNotFoundRoute() {
  return (
    <NotFoundPage
      errorType="404"
      variant="friendly"
      showSearch={true}
      showAiButtons={true}
    />
  );
}

export function TarsErrorRoute({ errorDetails }: { errorDetails?: string }) {
  return (
    <NotFoundPage
      errorType="500"
      variant="professional"
      errorDetails={errorDetails}
      showAiButtons={true}
    />
  );
}