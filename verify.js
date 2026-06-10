const http = require('http');

const data = JSON.stringify({
  identifier: 'user@sehatra.com',
  password: 'user123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    console.log('BODY:', body);
    if (res.statusCode === 200) {
      console.log('VERIFICATION SUCCESSFUL: Login works with new credentials!');
    } else {
      console.log('VERIFICATION FAILED!');
    }
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  process.exit(1);
});

req.write(data);
req.end();
