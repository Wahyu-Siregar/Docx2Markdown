import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';
import electron from 'electron';

test('starts Electron without a preload loading error', async () => {
  const app = spawn(electron, ['.', '--enable-logging'], {
    cwd: new URL('..', import.meta.url),
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderr = '';
  app.stderr.setEncoding('utf8').on('data', chunk => stderr += chunk);

  try {
    await new Promise(resolve => setTimeout(resolve, 3000));
    assert.equal(app.exitCode, null, stderr);
    assert.doesNotMatch(stderr, /Unable to load preload|ERR_UNSUPPORTED_ESM_URL_SCHEME/);
  } finally {
    app.kill();
  }
});
