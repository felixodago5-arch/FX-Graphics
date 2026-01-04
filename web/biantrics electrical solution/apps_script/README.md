Setup & deploy Google Apps Script Web App

1. Create the Google Sheet
   - Create a Google Sheet and note its ID from the URL: https://docs.google.com/spreadsheets/d/<THIS_IS_THE_ID>/edit
   - Name the first sheet `Sheet1` or update the `SHEET_NAME` constant in the script.

2. Create Apps Script project
   - In Google Drive: New → More → Google Apps Script
   - Replace the default Code.gs with the contents of `append_to_sheet.gs`.
   - Replace `SPREADSHEET_ID` with your sheet ID.

3. Deploy as Web App
   - Click Deploy → New deployment
   - Select "Web app"
   - Execute as: Me
   - Who has access: Anyone (or "Anyone, even anonymous")
   - Click Deploy and copy the Web app URL.

4. Update client-side URL
   - In `contact.html` replace the APPS_SCRIPT_URL placeholder with the Web app URL.

5. CORS and Permissions
   - If you deployed with "Anyone, even anonymous" and Execute as "Me", cross-origin fetch from your pages should work.
   - If you see CORS errors, consider calling the Apps Script from a server-side proxy (Netlify Function, Cloud Function) instead.

6. Optional: simple token
   - For a bit of protection, set a short static token in the Apps Script and include it in the client headers or JSON payload.
   - Note: Secrets included in client JS are visible to users and are not fully secure.

7. Test
   - Open your site (serve over http(s)), fill the contact form and submit.
   - Check DevTools → Network → confirm POST to the Apps Script URL and response.
   - Check the Google Sheet to see appended rows.

Security notes
- Making the Apps Script public allows anyone to append rows. Use this only for low-volume/test usage or add server-side verification.
- For production, use a server-side function that stores credentials securely and writes to the sheet.
