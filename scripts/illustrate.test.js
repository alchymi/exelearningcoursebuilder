const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { plan, loadKey, generate } = require('./illustrate');
const brief = { decision: 'generate', reason: 'Explain a verification action', objective: 'Verify sender', audience: 'Adults', scene: 'A worker calls a colleague', alt: 'Une personne téléphone.' };
test('non-generation decisions require no visual brief or credentials', () => {
  for (const decision of ['skip', 'diagram', 'source']) assert.equal(plan({ decision, reason: 'Use existing text' }).input, undefined);
  assert.throws(() => plan({ ...brief, decision: 'unknown' }));
  assert.throws(() => plan({ ...brief, alt: '' }));
});
test('pedagogical purpose selects an appropriate API style', () => {
  assert.equal(plan({ ...brief, purpose: 'scenario' }).input.style, 'REALISTIC');
  assert.equal(plan(brief).input.num_images, 1);
  assert.match(plan(brief).input.prompt, /Verify sender/);
});
test('credential parsing does not embed a key in the prompt', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fal-key-test-'));
  const previous = process.env.FAL_KEY;
  try {
    delete process.env.FAL_KEY;
    fs.writeFileSync(path.join(dir, 'key'), 'apikeyfal: example-secret');
    assert.equal(loadKey(path.join(dir, 'key')), 'example-secret');
    assert.ok(!JSON.stringify(plan(brief)).includes('example-secret'));
    process.env.FAL_KEY = 'environment-secret';
    assert.equal(loadKey(path.join(dir, 'missing')), 'environment-secret');
  } finally {
    if (previous === undefined) delete process.env.FAL_KEY; else process.env.FAL_KEY = previous;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
test('queue lifecycle saves actual format and prevents duplicate submission', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fal-image-test-'));
  let submissions = 0;
  try {
    const api = async (url, key, input) => {
      assert.equal(key, 'test-key');
      if (input) { submissions++; return { request_id: 'test', status_url: 'https://queue.fal.run/status', response_url: 'https://queue.fal.run/result' }; }
      if (url.endsWith('/status')) return { status: 'COMPLETED' };
      return { images: [{ url: 'https://example.com/result' }] };
    };
    const download = async () => new Response(Buffer.from('test-image'), { headers: { 'content-type': 'image/webp' } });
    const out = path.join(dir, 'scene.png');
    const actual = await generate(plan(brief), out, 'test-key', api, download);
    assert.equal(path.extname(actual), '.webp');
    assert.equal(fs.readFileSync(actual, 'utf8'), 'test-image');
    const saved = JSON.parse(fs.readFileSync(out + '.generation.json'));
    assert.equal(saved.state, 'completed');
    assert.ok(!JSON.stringify(saved).includes('test-key'));
    await assert.rejects(generate(plan(brief), out, 'test-key', api, download));
    assert.equal(submissions, 1);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
