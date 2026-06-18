export async function downloadFile(url: string, filename?: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erro ao buscar arquivo");
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename || url.split("/").pop() || "arquivo";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

export function downloadDataAsFile(
  data: any[],
  filename: string,
  format: "csv" | "json" = "csv"
) {
  let content: string;
  let mimeType: string;

  if (format === "csv") {
    if (data.length === 0) {
      content = "";
    } else {
      const headers = Object.keys(data[0]).join(",");
      const rows = data
        .map((row) =>
          Object.values(row)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");
      content = headers + "\n" + rows;
    }
    mimeType = "text/csv;charset=utf-8;";
  } else {
    content = JSON.stringify(data, null, 2);
    mimeType = "application/json";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
