import test from 'node:test';
import assert from 'node:assert/strict';
import { clampProgress, EXPERIENCE_CHAPTERS, getAnimatedPose, poseStyles } from '../../src/components/animated-timeline.js';

test('untrusted progress has a finite, clamped starting or endpoint pose', () => {
  for (const value of [undefined, null, '', '0.5', NaN, Infinity, -Infinity, {}, []]) {
    assert.equal(clampProgress(value), 0);
    assert.deepEqual(getAnimatedPose(value), getAnimatedPose(0));
  }
  assert.deepEqual(getAnimatedPose(-100), getAnimatedPose(0));
  assert.deepEqual(getAnimatedPose(100), getAnimatedPose(1));
});

test('the roof and facade move separately, then reassemble before the aerial view', () => {
  const start = getAnimatedPose(0);
  const layers = getAnimatedPose(EXPERIENCE_CHAPTERS[1].target);
  const end = getAnimatedPose(1);
  assert.equal(start.roofY, 0);
  assert.equal(start.facadeLeftX, 0);
  assert.equal(start.facadeRightX, 0);
  assert.equal(start.coverOpacity, 1);
  assert.equal(layers.roofY, -180);
  assert.equal(layers.facadeLeftX, -72);
  assert.equal(layers.facadeRightX, 86);
  assert.equal(layers.coverOpacity, 0);
  assert.equal(end.roofY, 0);
  assert.equal(end.facadeLeftX, 0);
  assert.equal(end.facadeRightX, 0);
  assert.equal(end.modelOpacity, 0);
  assert.equal(end.aerialOpacity, 1);
});

test('the timeline is continuous, bounded and reversible at every sampled progress', () => {
  const forward = [];
  for (let index = 0; index <= 1000; index += 1) {
    const pose = getAnimatedPose(index / 1000);
    const numeric = Object.values(pose).filter(value => typeof value === 'number');
    assert.ok(numeric.every(Number.isFinite));
    assert.ok(pose.modelYaw >= -6 && pose.modelYaw <= 6);
    assert.ok(pose.roofY <= 0 && pose.roofY >= -180);
    assert.ok(pose.copyOpacity.every(value => value >= 0 && value <= 1));
    assert.ok(Math.abs(pose.copyOpacity.reduce((sum, value) => sum + value, 0) - 1) < 1e-10);
    if (index > 0) {
      const previous = forward[index - 1];
      assert.ok(Math.abs(pose.roofY - previous.roofY) < 3);
      assert.ok(Math.abs(pose.modelScale - previous.modelScale) < 0.01);
      assert.ok(Math.abs(pose.modelOpacity - previous.modelOpacity) < 0.02);
    }
    assert.ok(Object.values(poseStyles(pose)).every(value => !value.includes('NaN') && !value.includes('Infinity')));
    forward.push(pose);
  }
  for (let index = 1000; index >= 0; index -= 1) assert.deepEqual(getAnimatedPose(index / 1000), forward[index]);
});

test('chapter controls target their own chapter, including the completed neighborhood view', () => {
  EXPERIENCE_CHAPTERS.forEach((chapter, index) => {
    assert.equal(getAnimatedPose(chapter.target).chapterIndex, index);
    assert.ok(chapter.target >= 0 && chapter.target <= 1);
  });
  assert.ok(getAnimatedPose(EXPERIENCE_CHAPTERS[2].target).modelScale > 1.1);
  assert.equal(getAnimatedPose(EXPERIENCE_CHAPTERS[3].target).aerialOpacity, 1);
});
