'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {requestFailureLine}=require('./lib/harness.cjs');
const music='http://127.0.0.1:8000/audio/menu-principal.mp3';
test('somente cancelamento explícito de música durante navegação é esperado',()=>{
  assert.equal(requestFailureLine(music,'net::ERR_ABORTED',true),null);
  assert.match(requestFailureLine(music,'net::ERR_ABORTED',false),/ERR_ABORTED/);
  assert.match(requestFailureLine(music,'net::ERR_CONNECTION_RESET',true),/ERR_CONNECTION_RESET/);
  assert.match(requestFailureLine('http://127.0.0.1:8000/js/17-input-ui.js','net::ERR_ABORTED',true),/requestfailed/);
  assert.match(requestFailureLine(music,'',true),/requestfailed/);
});
