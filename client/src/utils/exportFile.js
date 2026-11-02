// Table ko Excel (.xlsx) ya PDF file mein bana kar download karwata hai.
// Dono libraries bhari hain, is liye sirf export dabane par load hoti hain (dynamic import).
//
// columns: [{ header: "Event", key: "event", width: 28 }, ...]
// rows:    [{ event: "Tech Expo", ... }, ...]  (har value text ya number)

// Aaj ki tareekh (aap ke time zone mein) file ke naam ke liye: "2026-10-30"
const todayStamp = () => new Date().toLocaleDateString("en-CA");

const saveBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportToExcel = async ({ fileName, sheetName, columns, rows }) => {
  const { default: ExcelJS } = await import("exceljs");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((column) => ({ header: column.header, key: column.key, width: column.width || 20 }));
  rows.forEach((row) => sheet.addRow(row));

  // Pehli line (headings) mota, aur scroll karne par bhi upar tiki rahe
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  saveBlob(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${fileName}-${todayStamp()}.xlsx`
  );
};

export const exportToPdf = async ({ fileName, title, columns, rows }) => {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.text(`Exported on ${todayStamp()}  |  ${rows.length} record(s)`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => String(row[column.key] ?? ""))),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229] }
  });

  doc.save(`${fileName}-${todayStamp()}.pdf`);
};
