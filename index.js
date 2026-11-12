const http = require('http');
const fs = require('fs');
const path = require('path');
const { CITIES, findCity, timeIn } = require('./cities');

const PORT = process.env.PORT || 8080;
const PAGE = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method !== 'GET') {
    return sendJson(res, 404, { error: 'Not found' });
  }

  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(PAGE);
  }

  if (url.pathname === '/api/time') {
    const query = url.searchParams.get('city');
    if (!query) {
      return sendJson(res, 200, { time: new Date().toUTCString() });
    }
    const city = findCity(query);
    if (!city) {
      return sendJson(res, 404, {
        error: `Unknown city "${query}"`,
        hint: 'See /api/cities for supported cities',
      });
    }
    return sendJson(res, 200, timeIn(city));
  }

  if (url.pathname === '/api/cities') {
    const now = new Date();
    return sendJson(res, 200, {
      timestamp: now.toISOString(),
      cities: CITIES.map((c) => timeIn(c, now)),
    });
  }

  return sendJson(res, 404, { error: 'Not found' });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = server;
