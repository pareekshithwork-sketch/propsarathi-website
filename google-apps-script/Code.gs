function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Country Code',
        'City',
        'Property Type',
        'Budget',
        'Message',
        'Source',
        'Status'
      ]);
    }
    
    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();
    
    // Append the data row
    var rowData = [
      timestamp,
      data.firstName || "",
      data.lastName || "",
      data.email || "",
      data.phone || "",
      data.countryCode || "",
      data.city || "",
      data.propertyType || "",
      data.budget || "",
      data.message || "",
      data.source || "Website",
      data.status || "New"
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Data saved successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
