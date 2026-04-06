/**
 * Convert an array of objects to a CSV string and trigger a browser download.
 * @param {Object[]} rows  - Array of data objects
 * @param {string[]} cols  - Column keys to include (in order)
 * @param {string[]} headers - Column header labels (same order as cols)
 * @param {string}   filename - Download filename (without .csv)
 */
export function exportToCsv(rows, cols, headers, filename) {
  const escape = (v) => {
    const s = String(v === null || v === undefined ? '' : v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const csvRows = [
    headers.map(escape).join(','),
    ...rows.map(r => cols.map(c => escape(r[c])).join(',')),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
