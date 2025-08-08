import React from "react";

const ErrorState = ({
  toggleDebugInfo,
  showDebugInfo,
  errorStack,
  schemaDebugInfo,
  error,
}) => {
  return (
    <div className="p-4">
      <div className="p-6 bg-red-50 rounded-lg mb-4">
        <h1 className="text-2xl font-bold text-red-800">Error</h1>
        <p className="text-red-600">{error}</p>
      </div>

      <div className="mb-4">
        <button
          onClick={toggleDebugInfo}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          {showDebugInfo ? "Hide" : "Show"} Debug Information
        </button>
      </div>

      {showDebugInfo && (
        <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2">Stack Trace</h2>
          {errorStack ? (
            <pre className="text-xs whitespace-pre-wrap bg-gray-800 text-white p-4 rounded">
              {errorStack}
            </pre>
          ) : (
            <p className="text-gray-600">No stack trace available</p>
          )}

          {schemaDebugInfo && (
            <>
              <h2 className="text-lg font-semibold mb-2 mt-4">
                Schema Debug Info
              </h2>
              <pre className="text-xs whitespace-pre-wrap bg-gray-800 text-white p-4 rounded">
                {JSON.stringify(schemaDebugInfo, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorState;
