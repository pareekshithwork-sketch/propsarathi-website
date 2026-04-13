# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the PropSarathi platform.

## Overview

The platform uses **3 separate Google Sheets** to organize data:

1. **Partner Sheet** - Stores partner registrations, leads, and partner-related data
2. **RM Sheet** - Stores relationship manager data and assignments
3. **Admin Sheet** - Stores form submissions, activity logs, and admin data

## Prerequisites

- Google Cloud Platform account
- Access to Google Sheets
- Admin access to PropSarathi platform

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "PropSarathi Integration")
4. Click "Create"

### 2. Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 3. Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the details:
   - **Name**: PropSarathi Service Account
   - **ID**: propsarathi-service
   - **Description**: Service account for PropSarathi Google Sheets integration
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 4. Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create" - a JSON file will be downloaded
6. **Keep this file secure!** It contains your credentials

### 5. Create Google Sheets

Create 3 separate Google Sheets:

#### Partner Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet named "PropSarathi - Partners"
3. Copy the Spreadsheet ID from the URL:
   \`\`\`
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   \`\`\`

#### RM Sheet
1. Create another sheet named "PropSarathi - RMs"
2. Copy the Spreadsheet ID

#### Admin Sheet
1. Create another sheet named "PropSarathi - Admin"
2. Copy the Spreadsheet ID

### 6. Share Sheets with Service Account

For **each of the 3 sheets**:

1. Click the "Share" button
2. Paste the service account email (from the JSON file: `client_email`)
3. Set permission to "Editor"
4. Uncheck "Notify people"
5. Click "Share"

### 7. Configure PropSarathi Platform

#### Option A: Via Admin Dashboard (Recommended)

1. Log in to the Admin Portal
2. Go to the "Settings" tab
3. Fill in the Google Sheets Integration form:
   - **Service Account Email**: Copy from JSON file (`client_email`)
   - **Private Key**: Copy from JSON file (`private_key`)
   - **Partner Spreadsheet ID**: From Partner sheet URL
   - **RM Spreadsheet ID**: From RM sheet URL
   - **Admin Spreadsheet ID**: From Admin sheet URL
4. Click "Save Configuration"
5. Add the credentials to your `.env` file as instructed

#### Option B: Via Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in the values:

\`\`\`env
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_PARTNER_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SHEETS_RM_SPREADSHEET_ID=1CyiNWt1YSB6oGNeLwEeFZckhnVVrqumuc85PhaF3vot
GOOGLE_SHEETS_ADMIN_SPREADSHEET_ID=1DziOXu2ZTC7pHOfMxFgGadlioWWsrvnvd96QibG4wpu
\`\`\`

3. Restart your application

### 8. Verify Integration

1. Submit a test form on the website
2. Check the Admin Sheet - you should see a new row with the form data
3. Check the Activity Logs sheet within the Admin Sheet
4. If data appears, the integration is working!

## Data Structure

### Partner Sheet Tabs
- **Partners** - Partner registration data
- **PartnerLeads** - Leads created by partners
- **ActivityLogs** - Partner-specific activity logs

### RM Sheet Tabs
- **RMs** - Relationship manager data
- **RMAssignments** - Lead assignments to RMs
- **ActivityLogs** - RM-specific activity logs

### Admin Sheet Tabs
- **ContactForms** - Website form submissions
- **ActivityLogs** - All platform activity logs
- **SystemEvents** - System-level events

## Troubleshooting

### "Permission denied" error
- Ensure the service account email has Editor access to all 3 sheets
- Check that you shared the correct email address

### "Invalid credentials" error
- Verify the private key is correctly formatted with `\n` for line breaks
- Ensure the client email matches the service account

### Data not appearing in sheets
- Check the browser console for errors
- Verify the spreadsheet IDs are correct
- Ensure the Google Sheets API is enabled in your project

### "Spreadsheet not found" error
- Double-check the spreadsheet IDs
- Ensure the sheets are shared with the service account
- Verify the service account has Editor permissions

## Security Best Practices

1. **Never commit** the `.env` file or service account JSON to version control
2. **Rotate credentials** periodically (every 90 days recommended)
3. **Use separate service accounts** for development and production
4. **Monitor API usage** in Google Cloud Console
5. **Set up alerts** for unusual activity
6. **Restrict API access** to only necessary scopes

## Mock Data Mode

If Google Sheets is not configured, the platform will automatically use **mock data mode**:
- All data is stored in memory (lost on server restart)
- Perfect for development and testing
- No external dependencies required
- Switch to Google Sheets anytime via Admin Dashboard

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the [Google Sheets API documentation](https://developers.google.com/sheets/api)
- Contact the development team

---

**Last Updated**: October 2025
