export const getPrimaryKey = (tableInfo: any) => {
  return tableInfo?.columns?.find((col: any) => col.isPrimaryKey);
};

export const exportToCSV = (data) => {
  if (!data || typeof data !== "object") return;

  Object.entries(data).forEach(([tableName, rows]) => {
    if (!Array.isArray(rows) || rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(","), // CSV header
      ...rows.map((row) =>
        headers
          .map((field) => {
            let value = row[field];
            if (typeof value === "object" && value !== null) {
              value = JSON.stringify(value);
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `${tableName}_${new Date().toISOString().slice(0, 10)}.csv`;

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
