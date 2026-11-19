import test from 'node:test';
import assert from 'node:assert/strict';
import { getJourneyPose, JOURNEY_CHAPTERS } from '../../src/components/journey-timeline.js';

test('the architectural journey responds to early scroll and ends at the development overview', () => {
  assert.equal(getJourneyPose(0).globalFrame, 0);
  assert.ok(getJourneyPose(0.02).globalFrame >= 4);
  assert.equal(getJourneyPose(0.48).phase, 'interior');
  assert.equal(getJourneyPose(0.76).phase, 'structure');
  assert.equal(getJourneyPose(1).overview, 1);
  assert.equal(getJourneyPose(1).globalFrame, 119);
  assert.ok(JOURNEY_CHAPTERS.every((chapter, index) => getJourneyPose(chapter.target).chapterIndex === index));
});

test('scene handoffs retain the preceding frame before blending into the next camera move', () => {
  for (const boundary of [0.36, 0.62]) {
    assert.equal(getJourneyPose(boundary).transition, 0);
    assert.equal(getJourneyPose(boundary).localProgress, 0);
    assert.ok(getJourneyPose(boundary + 0.0175).transition > 0.49);
    assert.ok(getJourneyPose(boundary + 0.0175).transition < 0.51);
    assert.equal(getJourneyPose(boundary + 0.0351).transition, 1);
  }
});

test('the complete journey is bounded and reverses through the same poses', () => {
  const forward = Array.from({ length: 1001 }, (_, index) => getJourneyPose(index / 1000));
  for (let index = 1000; index >= 0; index--) {
    const pose = getJourneyPose(index / 1000);
    assert.deepEqual(pose, forward[index]);
    assert.ok(pose.globalFrame >= 0 && pose.globalFrame <= 119);
    for (const key of ['progress', 'localProgress', 'transition', 'overview', 'introduction']) assert.ok(pose[key] >= 0 && pose[key] <= 1);
    if (index > 0) assert.ok(pose.globalFrame >= forward[index - 1].globalFrame);
  }
  for (const value of [NaN, Infinity, undefined, '0.5']) assert.equal(getJourneyPose(value).progress, 0);
});
