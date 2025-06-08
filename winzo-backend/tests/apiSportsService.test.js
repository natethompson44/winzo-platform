const assert = require('assert');
const apiSportsService = require('../src/services/apiSportsService');

module.exports = async function () {
  let calls = 0;
  // mock httpClient
  apiSportsService.httpClient = {
    get: async () => {
      calls += 1;
      return { data: { ok: true }, headers: {} };
    }
  };

  const first = await apiSportsService.request('/mock');
  const second = await apiSportsService.request('/mock');

  assert.deepStrictEqual(first, { ok: true }, 'Response mismatch');
  assert.strictEqual(calls, 1, 'Cache should prevent second HTTP call');
};
