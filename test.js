const assert = require('assert');
const http = require('http');
const server = require('./index');

function get(port, path) {
  return new Promise((resolve, reject) => {
    http.get({ port, path }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

server.listen(0, async () => {
  const { port } = server.address();
  try {
    const home = await get(port, '/');
    assert.strictEqual(home.status, 200);
    assert.ok(home.body.includes('Hello from Node!'));

    const time = await get(port, '/api/time');
    assert.strictEqual(time.status, 200);
    const { time: t } = JSON.parse(time.body);
    assert.ok(t.endsWith('GMT'), `expected UTC string, got ${t}`);
    assert.ok(!Number.isNaN(Date.parse(t)));

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
