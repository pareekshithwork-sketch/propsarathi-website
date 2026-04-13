# Google Sheets Webhook Setup Instructions

## Quick Setup (Recommended)

The easiest way to configure Google Sheets integration is to use v0's environment variables:

### Step 1: Add Your Webhook URL to v0

1. In v0, click **"Vars"** in the left sidebar
2. Find or add: `GOOGLE_SHEETS_WEBHOOK_URL`
3. Paste your Google Apps Script webhook URL
4. Click Save

That's it! Your forms will now submit directly to Google Sheets.

---

## Getting Your Webhook URL

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "PropSarathi - Website Forms" (or any name you prefer)

### Step 2: Add the Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste this code:

\`\`\`javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);
    
    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone', 
        'Country Code', 'City', 'Property Type', 'Budget', 'Message', 'Source', 'Status'
      ]);
    }
    
    // Append the data
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.countryCode || '+91',
      data.city || '',
      data.propertyType || '',
      data.budget || '',
      data.message || '',
      data.source || 'Website',
      data.status || 'New'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
\`\`\`

4. Click **Save** (💾 icon)

### Step 3: Deploy the Script

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Authorize** the script (you'll need to grant permissions)
7. **Copy the Web app URL** - it looks like:
   \`\`\`
   https://script.google.com/macros/s/AKfycby.../exec
   \`\`\`

### Step 4: Add to v0

1. In v0, click **"Vars"** in the left sidebar
2. Add: `GOOGLE_SHEETS_WEBHOOK_URL`
3. Paste your webhook URL
4. Click Save

---

## Multiple Sheets (Optional)

If you want separate sheets for Partners and RMs:

1. Create additional Google Sheets
2. Add the same Apps Script to each
3. Deploy each script to get separate webhook URLs
4. Add these environment variables in v0:
   - `GOOGLE_SHEETS_PARTNER_WEBHOOK_URL` - for partner submissions
   - `GOOGLE_SHEETS_RM_WEBHOOK_URL` - for RM submissions

---

## Testing

1. Submit a test form on your website
2. Check your Google Sheet - you should see a new row with the form data
3. If it doesn't work, check the debug logs in v0

---

## Troubleshooting

**Form not submitting?**
- Make sure you've added the webhook URL to v0's Vars section
- Check that the webhook URL ends with `/exec`
- Verify you authorized the script when deploying

**Getting authorization errors?**
- Redeploy the script and authorize it again
- Make sure "Who has access" is set to "Anyone"

**Data not appearing in sheet?**
- Check the Apps Script execution logs (View → Executions)
- Make sure the sheet has the correct headers
- Try submitting again

---

## Alternative: Admin Portal Configuration

You can also configure webhook URLs through the Admin Portal:

1. Go to `/admin-portal`
2. Login with: **Admin** / **Admin123**
3. Click the **Settings** tab
4. Paste your webhook URLs
5. Click **Save Configuration**

Note: Environment variables (Vars) take priority over Admin Portal configuration.
