const https = require('https');

// Fallback Google Script URL provided by user
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyPcx8EGrwY0POivVwY2biKTFYdSh6XSgCVq0mwOGc0NEhaZkDcXbdwyLdCHn0FDjkhVA/exec';

function sendToGoogleSheet(data) {
  return new Promise((resolve) => {
    try {
      const postData = JSON.stringify(data);
      const req = https.request(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, res => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          if (res.headers.location) {
            https.get(res.headers.location, redirectRes => {
              let body = '';
              redirectRes.on('data', chunk => body += chunk);
              redirectRes.on('end', () => resolve(true));
            }).on('error', () => resolve(false));
          } else {
            resolve(false);
          }
        } else {
          resolve(true);
        }
      });
      req.on('error', () => resolve(false));
      req.write(postData);
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

module.exports = { sendToGoogleSheet };
