# Direct Google Sheets Integration Setup Guide

This guide explains how to set up direct Google Sheets integration for PropSarathi without needing API keys. Form submissions will go directly to your Google Sheets using Google Apps Script webhooks.

## Overview

The system uses **3 separate Google Sheets**:
1. **Partner Sheet** - For partner portal data
2. **RM Sheet** - For relationship manager data  
3. **Website Forms Sheet** - For all website form submissions

## Setup Steps

### Step 1: Create Your Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create 3 new spreadsheets:
   - `PropSarathi - Partners`
   - `PropSarathi - RMs`
   - `PropSarathi - Website Forms`

### Step 2: Add Apps Script to Each Sheet

For **each** of the 3 sheets, follow these steps:

1. Open the Google Sheet
2. Click **Extensions** → **Apps Script**
3. Delete any existing code
4. Copy and paste this code:

\`\`\`javascript
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheetName || 'Sheet1';
    const rowData = data.data;
    
    // Get the active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Add headers
      const headers = Object.keys(rowData);
      sheet.appendRow(headers);
    }
    
    // Get headers from first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // If sheet is empty, add headers
    if (headers.length === 0 || headers[0] === '') {
      const newHeaders = Object.keys(rowData);
      sheet.appendRow(newHeaders);
    }
    
    // Get updated headers
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Create row array matching header order
    const row = currentHeaders.map(header => rowData[header] || '');
    
    // Append the data
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data added successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Web App is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
\`\`\`

5. Click **Save** (💾 icon)
6. Name your project (e.g., "PropSarathi Webhook")

### Step 3: Deploy as Web App

For **each** Apps Script project:

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: "PropSarathi Form Webhook"
   - **Execute as**: Me (your email)
   - **Who has access**: **Anyone** (important!)
5. Click **Deploy**
6. **Copy the Web App URL** - it looks like:
   \`\`\`
   https://script.google.com/macros/s/AKfycbx.../exec
   \`\`\`
7. Save this URL - you'll need it for the admin dashboard

### Step 4: Configure in Admin Dashboard

1. Log into the **Admin Portal** at `/admin-portal`
2. Go to the **Settings** tab
3. Paste the webhook URLs:
   - **Partner Sheet Webhook URL**: URL from Partner sheet's Apps Script
   - **RM Sheet Webhook URL**: URL from RM sheet's Apps Script
   - **Website Forms Webhook URL**: URL from Website Forms sheet's Apps Script
4. Click **Save Configuration**

### Step 5: Test the Integration

1. Submit a test form on your website
2. Check the corresponding Google Sheet
3. You should see a new row with the form data

## Sheet Structure

### Website Forms Sheet
Columns automatically created:
- `formType` - Type of form (enquiry, contact, etc.)
- `firstName` - User's first name
- `lastName` - User's last name
- `email` - User's email
- `phone` - User's phone with country code
- `city` - City of interest
- `propertyType` - Type of property
- `budget` - Budget range
- `message` - User's message
- `timestamp` - Submission timestamp

### Partner Sheet
Columns automatically created:
- `partnerId` - Unique partner ID
- `name` - Partner name
- `email` - Partner email
- `phone` - Partner phone
- `status` - active/pending/inactive
- `registeredAt` - Registration timestamp

### RM Sheet
Columns automatically created:
- `rmId` - Unique RM ID
- `name` - RM name
- `email` - RM email
- `phone` - RM phone
- `status` - active/inactive
- `registeredAt` - Registration timestamp

## Troubleshooting

### Forms not submitting to sheets?

1. **Check webhook URL**: Make sure you copied the complete URL including `/exec` at the end
2. **Check permissions**: The Apps Script must be deployed with "Anyone" access
3. **Check sheet sharing**: No need to share the sheet - the Apps Script runs as you
4. **Test the webhook**: Visit the webhook URL in your browser - you should see `{"status":"Web App is running"}`

### Getting "Authorization required" error?

1. When you first deploy, Google will ask you to authorize the script
2. Click **Review Permissions**
3. Choose your Google account
4. Click **Advanced** → **Go to [Project Name] (unsafe)**
5. Click **Allow**

### Data not appearing in correct format?

1. Check that the first row of your sheet has headers
2. The script will auto-create headers from the first submission
3. Delete the sheet and let it recreate if needed

## Security Notes

- The webhook URLs are public but only accept POST requests with specific data format
- No sensitive data is exposed through the webhook
- All data is stored in your private Google Sheets
- You control access to the sheets through Google Drive sharing

## Benefits of This Approach

✅ **No API keys needed** - Simple webhook-based integration  
✅ **Real-time updates** - Data appears instantly in sheets  
✅ **No rate limits** - Google Apps Script handles all requests  
✅ **Easy to set up** - Just copy/paste code and URLs  
✅ **Separate sheets** - Organized data for different purposes  
✅ **Automatic headers** - Columns created automatically  
✅ **Free** - No costs for Google Apps Script usage  

## Advanced: Custom Sheet Names

You can organize data into multiple tabs within each sheet by modifying the form submission to include a `sheetName` parameter. The Apps Script will automatically create new tabs as needed.

## Support

If you encounter issues:
1. Check the Apps Script execution logs: **Executions** tab in Apps Script editor
2. Verify the webhook URL is correct
3. Test with a simple curl command:
\`\`\`bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"sheetName":"Test","data":{"test":"value","timestamp":"2024-01-01"}}'
\`\`\`

---

**Last Updated**: January 2025  
**Version**: 1.0
