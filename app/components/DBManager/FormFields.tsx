import React from "react";

export function getDefaultValue(column: any) {
  if (column.isAutoIncrement || (column.isPrimaryKey && column.hasDefault)) {
    return null; // Don't provide defaults for auto-increment fields
  }

  if (column.type.includes("Boolean")) return false;
  if (column.type.includes("Timestamp") && !column.hasDefault) {
    return new Date().toISOString().slice(0, 16);
  }
  if (
    column.name.toLowerCase().includes("created") &&
    column.type.includes("Timestamp")
  ) {
    return new Date().toISOString().slice(0, 16);
  }
  if (
    column.name.toLowerCase().includes("updated") &&
    column.type.includes("Timestamp")
  ) {
    return new Date().toISOString().slice(0, 16);
  }

  return "";
}

const FormFields = ({ column, value, getDefaultValue, handleInputChange }) => {
  const defaultValue = value !== undefined ? value : getDefaultValue(column);

  const inputProps = {
    name: column.name,
    value: defaultValue || "",
    onChange: (e: any) => handleInputChange(column.name, e.target.value),
    className:
      "w-full border border-gray-300 focus:outline-none  text-[#9E9C92] py-2 px-2.5 rounded-lg text-xs font-medium font-inter",
    required: column.isNotNull && !column.hasDefault && !column.isAutoIncrement,
  };

  // Enum dropdown
  if (column.enumValues && Array.isArray(column.enumValues)) {
    return (
      <select {...inputProps}>
        <option value="">Select {column.name}...</option>
        {column.enumValues.map((option: string) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    );
  }

  // Boolean dropdown
  if (column.type.includes("Boolean")) {
    return (
      <select
        {...inputProps}
        defaultValue={
          defaultValue === true ? "true" : defaultValue === false ? "false" : ""
        }
      >
        <option value="">Select...</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  // Numeric inputs
  if (column.type.includes("Integer") || column.type.includes("Serial")) {
    return (
      <input
        {...inputProps}
        type="number"
        placeholder="Enter number"
        step="1"
      />
    );
  }

  if (column.type.includes("Float") || column.type.includes("Numeric")) {
    return (
      <input
        {...inputProps}
        type="number"
        placeholder="Enter decimal number"
        step="0.01"
      />
    );
  }

  // Date/time inputs
  if (column.type.includes("Timestamp")) {
    const dateValue = defaultValue
      ? new Date(defaultValue).toISOString().slice(0, 16)
      : "";
    return <input {...inputProps} type="datetime-local" value={dateValue} />;
  }

  if (column.type.includes("Date")) {
    const dateValue = defaultValue
      ? new Date(defaultValue).toISOString().slice(0, 10)
      : "";
    return <input {...inputProps} type="date" value={dateValue} />;
  }

  // Smart input types based on column name
  if (column.name.toLowerCase().includes("email")) {
    return (
      <input {...inputProps} type="email" placeholder="Enter email address" />
    );
  }

  if (column.name.toLowerCase().includes("password")) {
    return (
      <input {...inputProps} type="password" placeholder="Enter password" />
    );
  }

  if (
    column.name.toLowerCase().includes("phone") ||
    column.name.toLowerCase().includes("mobile")
  ) {
    return (
      <input {...inputProps} type="tel" placeholder="Enter phone number" />
    );
  }

  if (
    column.name.toLowerCase().includes("url") ||
    column.name.toLowerCase().includes("website") ||
    column.name.toLowerCase().includes("link")
  ) {
    return <input {...inputProps} type="url" placeholder="Enter URL" />;
  }

  // Text area for long text fields
  if (column.type.includes("Text") && !column.type.includes("VarChar")) {
    return (
      <textarea
        {...inputProps}
        rows={3}
        placeholder={`Enter ${column.name.toLowerCase()}`}
      />
    );
  }

  // Default text input
  return (
    <input
      {...inputProps}
      type="text"
      placeholder={`Enter ${column.name.toLowerCase()}`}
    />
  );
};

export default FormFields;
