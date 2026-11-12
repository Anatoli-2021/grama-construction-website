import test from 'node:test';
import assert from 'node:assert/strict';
import { clampSequenceProgress, getFrameBlend, getFrameRect, getHouseClipProgress } from '../../src/components/artlist-house-sequence.js';

test('invalid progress cannot choose an absent frame', () => {
  for (const value of [undefined, null, '', '0.5', NaN, Infinity, -Infinity, {}, []]) {
    assert.equal(clampSequenceProgress(value), 0);
    assert.deepEqual(getFrameBlend(value), { lower: 0, upper: 1, blend: 0 });
    assert.equal(getHouseClipProgress(value), 0);
  }
  assert.deepEqual(getFrameBlend(2), { lower: 39, upper: 39, blend: 0 });
  assert.deepEqual(getFrameBlend(-2), { lower: 0, upper: 1, blend: 0 });
  assert.deepEqual(getFrameBlend(0.5, 1), { lower: 0, upper: 0, blend: 0 });
});

test('page phases hold, open, hold the structure, and close before the aerial', () => {
  assert.equal(getHouseClipProgress(0), 0);
  assert.equal(getHouseClipProgress(0.08), 0);
  assert.ok(Math.abs(getHouseClipProgress(0.25) - 0.5) < 1e-12);
  assert.equal(getHouseClipProgress(0.42), 1);
  assert.equal(getHouseClipProgress(0.66), 1);
  assert.equal(getHouseClipProgress(0.75), 1);
  assert.ok(Math.abs(getHouseClipProgress(0.81) - 0.5) < 1e-12);
  assert.equal(getHouseClipProgress(0.87), 0);
  assert.equal(getHouseClipProgress(1), 0);
});

test('every sampled position is bounded, continuous and independent of scroll direction', () => {
  const samples = [];
  for (let index = 0; index <= 1000; index++) {
    const clip = getHouseClipProgress(index / 1000);
    const frame = getFrameBlend(clip);
    assert.ok(clip >= 0 && clip <= 1);
    assert.ok(Number.isInteger(frame.lower) && frame.lower >= 0 && frame.lower < 40);
    assert.ok(Number.isInteger(frame.upper) && frame.upper >= frame.lower && frame.upper < 40);
    assert.ok(frame.blend >= 0 && frame.blend < 1);
    if (index > 0) assert.ok(Math.abs(clip - samples[index - 1].clip) < 0.013);
    samples.push({ clip, frame });
  }
  for (let index = 1000; index >= 0; index--) {
    const clip = getHouseClipProgress(index / 1000);
    assert.deepEqual({ clip, frame: getFrameBlend(clip) }, samples[index]);
  }
});

test('atlas tiles stay within their sheet and interpolate across sheet boundaries', () => {
  for (const [width, height] of [[960, 540], [640, 360]]) {
    for (let index = 0; index < 40; index++) {
      const tile = getFrameRect(index, width, height);
      assert.equal(tile.sheetIndex, Math.floor(index / 10));
      assert.ok(tile.sx >= 0 && tile.sx + tile.width <= width * 2);
      assert.ok(tile.sy >= 0 && tile.sy + tile.height <= height * 5);
    }
    const blend = getFrameBlend(9.5 / 39);
    assert.equal(blend.lower, 9);
    assert.equal(blend.upper, 10);
    assert.equal(blend.blend, 0.5);
    assert.deepEqual(getFrameRect(blend.lower, width, height), { sheetIndex: 0, sx: width, sy: height * 4, width, height });
    assert.deepEqual(getFrameRect(blend.upper, width, height), { sheetIndex: 1, sx: 0, sy: 0, width, height });
    assert.deepEqual(getFrameRect(99, width, height), getFrameRect(39, width, height));
    assert.deepEqual(getFrameRect(NaN, width, height), getFrameRect(0, width, height));
  }
});
