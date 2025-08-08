import React from "react";

const Cell = ({ getValue, column }) => {
  const value = getValue();
  if (value === null || value === undefined)
    return (
      <span className="text-zinc-800 text-xs font-normal font-['IBM_Plex_Mono'] leading-none">
        null
      </span>
    );

  if (typeof value === "boolean") {
    return (
      <span
        className={`px-2 py-1 text-zinc-800 text-xs font-normal font-['IBM_Plex_Mono'] leading-none rounded-full ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {value ? "true" : "false"}
      </span>
    );
  }

  if (typeof value === "object") {
    return (
      <span className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">
        {JSON.stringify(value)}
      </span>
    );
  }

  if (
    typeof value === "string" &&
    (column.type.includes("Timestamp") || column.type.includes("Date"))
  ) {
    try {
      return (
        <span className="text-zinc-800 text-xs font-normal font-['IBM_Plex_Mono'] leading-none">
          {new Date(value).toLocaleString()}
        </span>
      );
    } catch {
      return <span className="text-red-500">Invalid Date</span>;
    }
  }

  const strValue = String(value);
  return strValue.length > 50 ? (
    <span
      title={strValue}
      className="text-zinc-800 text-xs font-normal font-['IBM_Plex_Mono'] leading-none"
    >
      {strValue.substring(0, 50)}...
    </span>
  ) : (
    strValue
  );
};

export default Cell;
