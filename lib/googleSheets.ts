// Stub file for backward compatibility
// The old Google Sheets API integration has been replaced with webhook-based integration
// This file exists only to prevent import errors in legacy code

export async function appendToSheet(sheetName: string, data: any[]): Promise<void> {
  console.warn("[v0] appendToSheet is deprecated. Please use the webhook-based integration instead.")
  // Do nothing - this is a stub
}

export async function initializeSheetHeaders(sheetName: string, headers: string[]): Promise<void> {
  console.warn("[v0] initializeSheetHeaders is deprecated. Please use the webhook-based integration instead.")
  // Do nothing - this is a stub
}

export async function readFromSheet(sheetName: string): Promise<any[]> {
  console.warn("[v0] readFromSheet is deprecated. Please use the webhook-based integration instead.")
  return []
}

export async function updateSheet(sheetName: string, rowIndex: string | number, data: any[]): Promise<void> {
  console.warn("[v0] updateSheet is deprecated. Please use the webhook-based integration instead.")
  // Do nothing - this is a stub
}
