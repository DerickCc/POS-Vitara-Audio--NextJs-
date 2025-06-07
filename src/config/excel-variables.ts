export const EXCEL_MONEY_FMT = '_-[$Rp-id-ID]* #,##0.00_-;-[$Rp-id-ID]* #,##0.00_-;_-[$Rp-id-ID]* "-"??_-;_-@_-';
export const PPN_RATE = 0.11;

export const STYLES = {
  title: {
    font: { size: 16, bold: true, color: { argb: 'FF2F2F2F' } },
  },
  header: {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF4472C4' } }, // Biru tua
    border: {
      top: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
      left: { style: 'thin' as const },
      right: { style: 'thin' as const },
    },
    alignment: { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true },
  },
  // --- Payment Status's Styles  ---
  greenFill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFC6EFCE' } }, // Light Green
  redFill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFC7CE' } }, // Light Yellow
  biruFill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'ffdce6f1' } }, // Light Blue
  grayFill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'ffd6d6d6' } }, // Gray
  // --- Other Styles ---
  topBorder: { top: { style: 'medium' as const, color: { argb: 'FF7F7F7F' } } },
  fullBorder: {
    top: { style: 'thin' as const },
    bottom: { style: 'thin' as const },
    left: { style: 'thin' as const },
    right: { style: 'thin' as const },
  },
  defaultAlignment: { vertical: 'middle' as const, wrapText: true, horizontal: 'left' as const },
};
