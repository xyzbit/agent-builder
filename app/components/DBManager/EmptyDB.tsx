import React from "react";

const EmptyDB = ({ toggleDebugInfo, showDebugInfo, schemaDebugInfo }) => {
  return (
    <div>
      <div className="text-center p-8 bg-yellow-50 rounded-lg mb-4">
        <p className="text-yellow-700 font-semibold">
          No tables found in the database schema
        </p>
        <p className="text-yellow-600 mt-2">
          This could be because the database is empty or because the schema
          couldn't be loaded correctly.
        </p>
      </div>

      <div className="mb-4 text-center">
        <button
          onClick={toggleDebugInfo}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mx-auto"
        >
          {showDebugInfo ? "Hide" : "Show"} Debug Information
        </button>
      </div>

      {showDebugInfo && schemaDebugInfo && (
        <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2 mt-4">Schema Debug Info</h2>
          <pre className="text-xs whitespace-pre-wrap bg-gray-800 text-white p-4 rounded">
            {JSON.stringify(schemaDebugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EmptyDB;
