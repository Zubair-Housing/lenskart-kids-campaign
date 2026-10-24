const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const LEADS_FILE = path.join(__dirname, 'leads.json');

function readLeads() {
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeLead(lead) {
  const leads = readLeads();
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// Must be a plain 1-2 digit string, checked BEFORE Number() conversion.
// Number("1e1") is 10 and would silently pass a bare isNaN/range check.
const AGE_PATTERN = /^\d{1,2}$/;
// Indian mobile numbers start 6-9. A bare /^\d{10}$/ accepts "0000000000"
// or "1234567890", which are clearly not real numbers.
const PHONE_PATTERN = /^[6-9]\d{9}$/;

function validateLead(data) {
  const errors = {};
  const name = (data.parentName || '').toString().trim();
  const phone = (data.phone || '').toString().trim();
  const city = (data.city || '').toString().trim();
  const ageRaw = (data.kidAge || '').toString().trim();

  if (!name || name.length < 2) {
    errors.parentName = 'Enter a valid name (at least 2 characters).';
  }
  if (!PHONE_PATTERN.test(phone)) {
    errors.phone = 'Enter a valid 10-digit mobile number.';
  }
  if (!city || city.length < 2) {
    errors.city = 'Enter a valid city.';
  }
  let ageNum = null;
  if (!AGE_PATTERN.test(ageRaw)) {
    errors.kidAge = "Enter the kid's age as a number between 1 and 17.";
  } else {
    ageNum = Number(ageRaw);
    if (ageNum < 1 || ageNum > 17) {
      errors.kidAge = "Enter the kid's age as a number between 1 and 17.";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: { parentName: name, phone, city, kidAge: ageNum },
  };
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (req.method === 'POST' && parsed.pathname === '/api/leads') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body || '{}');
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, errors: { _form: 'Malformed request.' } }));
        return;
      }

      const { valid, errors, clean } = validateLead(data);
      if (!valid) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, errors }));
        return;
      }

      try {
        writeLead({ ...clean, submittedAt: new Date().toISOString() });
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, errors: { _form: 'Could not save your details. Please try again.' } }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  filePath = path.join(__dirname, 'public', filePath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Lenskart Kids campaign running at http://localhost:${PORT}`);
});
