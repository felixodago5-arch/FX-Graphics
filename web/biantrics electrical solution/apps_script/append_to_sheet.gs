 // Google Apps Script: append_to_sheet.gs
// Paste this into a new Apps Script project and set the SPREADSHEET_ID and sheet name.

const SPREADSHEET_ID = 'YOUR_SHEET_ID_HERE'; // <-- replace
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    // When called by fetch with JSON body
    const payload = JSON.parse(e.postData.contents || '{}');

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    // Optional simple token check (uncomment and set token on client)
    // const expectedToken = 'SOME_SIMPLE_TOKEN';
    // if (payload.token !== expectedToken) {
    //   return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Unauthorized'})).setMimeType(ContentService.MimeType.JSON);
    // }

    sheet.appendRow([
      new Date(),
      payload.fullName || '',
      payload.phone || '',
      payload.email || '',
      payload.subject || '',
      payload.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
