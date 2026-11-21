import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setFlagsFromString } from 'node:v8';

setFlagsFromString('--no-incremental-marking');
const kit = new URL('../csv-reader-speed-01-run-20261121-kit/', import.meta.url);
const load = (path) => JSON.parse(readFileSync(new URL(path, kit), 'utf8'));
const { run } = await import('./solve.js');
const { run: reference } = await import(new URL('baselines/csv-reader/solve.js', kit));
const cases = load('practice/input/cases.json');

if (process.argv.includes('--bench')) {
  console.log('case UTF-16-units baseline-ms entry-ms speedup (median CPU per parse)');
  for (const { id, input } of cases) {
    const implementations = [reference, run];
    const samples = [[], []];
    for (let round = -3; round < 7; round++) {
      for (const index of (round % 2 === 0 ? [0, 1] : [1, 0])) {
        global.gc?.();
        const parse = implementations[index];
        const repeats = index === 0 ? 5 : 40;
        const start = process.cpuUsage();
        for (let i = 0; i < repeats; i++) parse(input);
        const { user, system } = process.cpuUsage(start);
        if (round >= 0) samples[index].push((user + system) / (1000 * repeats));
      }
    }
    const [baseline, entry] = samples.map((times) => times.sort((a, b) => a - b)[3]);
    console.log(id, input.text.length, baseline.toFixed(2), entry.toFixed(2),
      (baseline / entry).toFixed(2) + 'x');
  }
} else {
  const expected = load('practice/reference/expected.json').cases;
  assert.deepEqual(cases.map(({ id }) => id), expected.map(({ id }) => id));
  for (let i = 0; i < cases.length; i++) {
    assert.deepEqual(run(cases[i].input), expected[i].output, cases[i].id);
  }
  console.log('All ' + cases.length + ' official practice answers match');

  let checked = 0;
  function check(text) {
    for (const header of [false, true]) {
      const input = { text, header };
      assert.deepEqual(run(input), reference(input), JSON.stringify(input));
      checked++;
    }
  }
  function enumerate(prefix, depth) {
    check(prefix);
    if (depth === 0) return;
    for (const char of ['a', ',', '"', '\r', '\n']) enumerate(prefix + char, depth - 1);
  }
  enumerate('', 7);
  let state = 0x8e93cb41;
  function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  const tokens = ['a', ',', '"', '\r', '\n', '\r\n', '""', '\uFEFF', '東京', '🦊', '\ud800', '\0'];
  for (let trial = 0; trial < 25_000; trial++) {
    let text = '';
    const count = next() % 160;
    for (let i = 0; i < count; i++) text += tokens[next() % tokens.length];
    check(text);
  }
  console.log(checked + ' differential checks passed');
}
