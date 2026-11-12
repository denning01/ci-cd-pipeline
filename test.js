const assert = require('assert');
const http = require('http');
const server = require('./index');
const { CITIES, findCity, timeIn } = require('./cities');

function get(port, path) {
  return new Promise((resolve, reject) => {
    http.get({ port, path }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

// Unit checks for the time-zone helper (fixed instant, no network)
function unitTests() {
  const instant = new Date('2026-01-15T22:30:00Z');
  const nairobi = timeIn(findCity('nairobi'), instant); // UTC+3
  assert.strictEqual(nairobi.date, '2026-01-16');
  assert.strictEqual(nairobi.time, '01:30:00');
  assert.strictEqual(nairobi.utcOffset, '+03:00');
  assert.strictEqual(nairobi.weekday, 'Friday');

  const accra = timeIn(findCity('Accra'), instant); // UTC+0
  assert.strictEqual(accra.date, '2026-01-15');
  assert.strictEqual(accra.time, '22:30:00');
  assert.strictEqual(accra.utcOffset, '+00:00');

  assert.strictEqual(findCity('Dar es Salaam').id, 'dar-es-salaam');
  assert.strictEqual(findCity('atlantis'), undefined);

  // Every configured zone must be valid
  for (const c of CITIES) timeIn(c, instant);
}

server.listen(0, async () => {
  const { port } = server.address();
  try {
    unitTests();

    const home = await get(port, '/');
    assert.strictEqual(home.status, 200);
    assert.ok(home.body.includes('Africa <span>Clock</span>'));

    const time = await get(port, '/api/time');
    assert.strictEqual(time.status, 200);
    const { time: t } = JSON.parse(time.body);
    assert.ok(t.endsWith('GMT'), `expected UTC string, got ${t}`);
    assert.ok(!Number.isNaN(Date.parse(t)));

    const lagos = await get(port, '/api/time?city=lagos');
    assert.strictEqual(lagos.status, 200);
    const l = JSON.parse(lagos.body);
    assert.strictEqual(l.city, 'Lagos');
    assert.strictEqual(l.timezone, 'Africa/Lagos');
    assert.match(l.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(l.time, /^\d{2}:\d{2}:\d{2}$/);

    const unknown = await get(port, '/api/time?city=atlantis');
    assert.strictEqual(unknown.status, 404);

    const list = await get(port, '/api/cities');
    assert.strictEqual(list.status, 200);
    assert.strictEqual(JSON.parse(list.body).cities.length, CITIES.length);

    const missing = await get(port, '/nope');
    assert.strictEqual(missing.status, 404);

    console.log('All tests passed');
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
