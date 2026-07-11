/**
 * A robust state-machine based CSV parser that handles:
 * - Commas within quoted fields
 * - Escaped double quotes ("")
 * - Newlines within quoted fields
 */
export function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" inside quotes becomes "
          curr += '"';
          i++; // Skip next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        curr += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(curr.trim());
        curr = '';
      } else if (char === '\r' || char === '\n') {
        row.push(curr.trim());
        curr = '';
        
        // Only push row if it contains some data
        if (row.length > 0 && row.some(cell => cell !== '')) {
          result.push(row);
        }
        
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n
        }
      } else {
        curr += char;
      }
    }
  }

  // Handle remaining characters
  if (curr !== '') {
    row.push(curr.trim());
  }
  if (row.length > 0 && row.some(cell => cell !== '')) {
    result.push(row);
  }

  return result;
}

/**
 * Converts parsed raw CSV rows (header + data) into an array of records (objects).
 */
export function csvToRecords(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  const records: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      // If row has fewer columns than headers, fill with empty string
      record[header] = index < row.length ? row[index] : '';
    });
    records.push(record);
  }

  return records;
}
