# 🚀 PropSarathi Website Setup Guide
## Complete Step-by-Step Instructions (No Technical Knowledge Required)

---

## Part 1: Setting Up Google Sheets (15 minutes)

### Step 1: Create Your Google Sheets

1. **Open Google Sheets**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Click the **"+ Blank"** button to create a new sheet
   - Name it: **"PropSarathi - Website Forms"**

2. **Create the Header Row**
   - In the first row, type these column names (one in each cell):
     - A1: `Timestamp`
     - B1: `First Name`
     - C1: `Last Name`
     - D1: `Email`
     - E1: `Phone`
     - F1: `Country Code`
     - G1: `City`
     - H1: `Property Type`
     - I1: `Budget`
     - J1: `Message`
     - K1: `Source`

3. **Repeat for Two More Sheets**
   - Create another sheet named: **"PropSarathi - Partners"**
   - Create another sheet named: **"PropSarathi - RMs"**
   - Add the same headers to both sheets

---

### Step 2: Add the Magic Script (This Makes Forms Work!)

1. **Open the Script Editor**
   - In your Google Sheet, click **Extensions** (top menu)
   - Click **Apps Script**
   - A new tab will open with a code editor

2. **Delete Everything**
   - You'll see some default code
   - Select all (Ctrl+A or Cmd+A)
   - Delete it

3. **Copy the Code from the File**
   - Go to the file: `google-apps-script/Code.gs` in your project
   - Copy ALL the code from that file
   - Paste it into the Google Apps Script editor

   **IMPORTANT:** Make sure you copy from the `Code.gs` file, NOT from this markdown guide!

4. **Save the Script**
   - Click the **💾 Save** icon (or press Ctrl+S / Cmd+S)
   - Name your project: **"PropSarathi Form Handler"**
   - Click **OK**

---

### Step 3: Deploy the Script (Make it Live!)

1. **Click Deploy**
   - Click the **Deploy** button (top right, looks like a rocket 🚀)
   - Select **"New deployment"**

2. **Configure the Deployment**
   - Click the **gear icon** ⚙️ next to "Select type"
   - Choose **"Web app"**

3. **Set Permissions**
   - Description: `PropSarathi Website Forms`
   - Execute as: **Me** (your email)
   - Who has access: **Anyone** (important!)
   - Click **Deploy**

4. **Authorize the App**
   - A popup will appear asking for permissions
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** (if you see a warning)
   - Click **Go to PropSarathi Form Handler (unsafe)**
   - Click **Allow**

5. **Copy Your Webhook URL**
   - You'll see a screen with a **Web app URL**
   - It looks like: `https://script.google.com/macros/s/ABC123.../exec`
   - Click **Copy** button
   - **SAVE THIS URL** - You'll need it in the next step!

6. **Repeat for Other Sheets**
   - Go back to your **"PropSarathi - Partners"** sheet
   - Repeat Steps 2-5 to get another webhook URL
   - Do the same for **"PropSarathi - RMs"** sheet
   - You should now have **3 webhook URLs**

---

## Part 2: Setting Up Environment Variables in v0

### Step 1: Add Environment Variables

1. **Open the v0 Sidebar**
   - Look at the left side of your v0 screen
   - Click on **"Vars"** (it has a key icon 🔑)

2. **Add Each Variable One by One**

   **Variable 1: Website Forms Webhook**
   - Click **"+ Add Variable"**
   - Name: `GOOGLE_SHEETS_WEBHOOK_URL`
   - Value: Paste the webhook URL from your **"Website Forms"** sheet
   - Click **Save**

   **Variable 2: Partner Webhook**
   - Click **"+ Add Variable"**
   - Name: `GOOGLE_SHEETS_PARTNER_WEBHOOK_URL`
   - Value: Paste the webhook URL from your **"Partners"** sheet
   - Click **Save**

   **Variable 3: RM Webhook**
   - Click **"+ Add Variable"**
   - Name: `GOOGLE_SHEETS_RM_WEBHOOK_URL`
   - Value: Paste the webhook URL from your **"RMs"** sheet
   - Click **Save**

   **Variable 4: Admin Webhook** (Optional - use same as Partner for now)
   - Click **"+ Add Variable"**
   - Name: `GOOGLE_SHEETS_ADMIN_WEBHOOK_URL`
   - Value: Paste the webhook URL from your **"Partners"** sheet
   - Click **Save**

   **Variable 5: JWT Secret** (Security Key)
   - Click **"+ Add Variable"**
   - Name: `JWT_SECRET`
   - Value: Type any random long text (example: `mySecretKey12345PropSarathi2025`)
   - Click **Save**

   **Variable 6: API URL**
   - Click **"+ Add Variable"**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: Leave empty for now (it will use the default)
   - Click **Save**

   **Variable 7: Google Client Email** (Optional)
   - Click **"+ Add Variable"**
   - Name: `GOOGLE_SHEETS_CLIENT_EMAIL`
   - Value: Your Google email (example: `yourname@gmail.com`)
   - Click **Save**

---

## Part 3: Testing Your Setup

### Test 1: Check if Website Loads

1. **Refresh the Preview**
   - Click the **refresh icon** 🔄 in the v0 preview window
   - Your website should now load without errors

2. **What You Should See**
   - Homepage with header and footer
   - All sections visible
   - Forms should be working

### Test 2: Submit a Test Form

1. **Fill Out a Form**
   - Scroll to any enquiry form on your website
   - Fill in:
     - First Name: `Test`
     - Last Name: `User`
     - Email: `test@example.com`
     - Phone: `1234567890`
     - Select a city and property type
     - Click **Submit**

2. **Check Your Google Sheet**
   - Go back to your **"PropSarathi - Website Forms"** sheet
   - Refresh the page
   - You should see a new row with your test data!
   - If you see the data, **IT WORKS!** 🎉

### Test 3: Check the Portals

1. **Partner Portal**
   - In the v0 preview, add `/partner-portal` to the URL
   - You should see the partner login/registration page

2. **Admin Portal**
   - Add `/admin-portal` to the URL
   - You should see the admin dashboard

---

## Part 4: What to Do If Something Doesn't Work

### Problem: Website Still Not Loading

**Solution:**
- Make sure all environment variables are added correctly
- Check that variable names are EXACTLY as shown (case-sensitive)
- Try refreshing the v0 preview again

### Problem: Form Submits But No Data in Google Sheet

**Solution:**
1. Check your webhook URL is correct (no extra spaces)
2. Make sure the Google Sheet script is deployed as **"Anyone"** can access
3. Check the Google Sheet has the correct header row
4. Try redeploying the script (Step 3 in Part 1)

### Problem: "Authorization Required" Error

**Solution:**
1. Go back to your Google Sheet
2. Click **Extensions** > **Apps Script**
3. Click **Deploy** > **Manage deployments**
4. Click **Edit** (pencil icon)
5. Make sure "Who has access" is set to **Anyone**
6. Click **Deploy**

### Problem: Syntax Error in Google Apps Script

**Solution:**
1. Make sure you copied the code from the `google-apps-script/Code.gs` file
2. Do NOT copy from this markdown guide (it has special characters)
3. Delete everything in the Apps Script editor
4. Copy ONLY from the Code.gs file
5. Paste and save

---

## Part 5: Going Live (When Ready)

### Step 1: Deploy to Vercel

1. **In v0, Click "Publish"**
   - Top right corner of v0
   - Click the **Publish** button
   - Follow the prompts to deploy to Vercel

2. **Add Environment Variables in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Open your project
   - Click **Settings** > **Environment Variables**
   - Add all the same variables you added in v0

### Step 2: Update Webhook URLs (If Needed)

- If you want separate sheets for production, create new sheets
- Deploy new scripts
- Update the environment variables in Vercel

---

## 📞 Need Help?

If you're stuck at any step:
1. Take a screenshot of the error
2. Note which step you're on
3. Contact support with this information

---

## ✅ Quick Checklist

Before you start, make sure you have:
- [ ] A Google account
- [ ] Access to v0
- [ ] 15-20 minutes of time

After setup, you should have:
- [ ] 3 Google Sheets created
- [ ] 3 webhook URLs copied
- [ ] 7 environment variables added in v0
- [ ] Website loading without errors
- [ ] Test form submission working

---

**Congratulations! Your PropSarathi website is now connected to Google Sheets! 🎉**

All form submissions will automatically appear in your Google Sheets in real-time.
