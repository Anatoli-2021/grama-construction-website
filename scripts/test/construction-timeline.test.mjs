import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSTRUCTION_CHAPTERS,
  CONSTRUCTION_FRAME_COUNT,
  CONSTRUCTION_SHEET_COUNT,
  CONSTRUCTION_SIZES,
  getConstructionFrameRect,
  getConstructionPose,
} from '../../src/components/construction-timeline.js';

test('construction begins on the first movement and reaches the completed final frame', () => {
  assert.equal(CONSTRUCTION_FRAME_COUNT, 336);
  assert.equal(getConstructionPose(0).globalFrame, 0);
  assert.ok(getConstructionPose(0.01).globalFrame > 0);
  assert.equal(getConstructionPose(1).globalFrame, 335);
  assert.equal(getConstructionPose(1).upperFrame, 335);
  assert.equal(getConstructionPose(1).blend, 0);
  assert.equal(getConstructionPose(1).stage, 'reveal');
  assert.equal(getConstructionPose(1).localProgress, 1);
  for (const value of [NaN, Infinity, -Infinity, undefined, null, '0.5']) {
    assert.equal(getConstructionPose(value).progress, 0);
  }
  assert.equal(getConstructionPose(-1).progress, 0);
  assert.equal(getConstructionPose(2).progress, 1);
});

test('all seven chapter anchors land in their own equal construction stage', () => {
  assert.deepEqual(CONSTRUCTION_CHAPTERS.map(chapter => chapter.id), [
    'land', 'community', 'approach', 'interior', 'structure', 'reassemble', 'reveal',
  ]);
  for (let index = 0; index < CONSTRUCTION_CHAPTERS.length; index++) {
    const chapter = CONSTRUCTION_CHAPTERS[index];
    const pose = getConstructionPose(chapter.target);
    assert.equal(pose.stageIndex, index);
    assert.equal(pose.stage, chapter.id);
    if (index > 0) assert.ok(chapter.target > CONSTRUCTION_CHAPTERS[index - 1].target);
    if (index < 6) {
      assert.equal(getConstructionPose((index + 0.25) / 7).stageIndex, index);
      assert.equal(getConstructionPose((index + 0.75) / 7).stageIndex, index);
    }
  }
});

test('every sampled construction pose is bounded, continuous and exactly reversible', () => {
  const forward = Array.from({ length: 2001 }, (_, index) => getConstructionPose(index / 2000));
  for (let index = 2000; index >= 0; index--) {
    const pose = getConstructionPose(index / 2000);
    assert.deepEqual(pose, forward[index]);
    assert.ok(Number.isInteger(pose.frame) && pose.frame >= 0 && pose.frame <= 335);
    assert.ok(pose.upperFrame >= pose.frame && pose.upperFrame <= Math.min(335, pose.frame + 1));
    for (const key of ['progress', 'blend', 'localProgress']) assert.ok(pose[key] >= 0 && pose[key] <= 1);
    assert.ok(Math.abs(pose.frame + pose.blend - pose.progress * 335) < 1e-10);
    if (index > 0) assert.ok(pose.globalFrame >= forward[index - 1].globalFrame);
  }
});

test('all 336 frames map to complete 2-by-2 sheets without crossing tile boundaries', () => {
  assert.equal(CONSTRUCTION_SHEET_COUNT, 84);
  for (const { width, height } of Object.values(CONSTRUCTION_SIZES)) {
    const tiles = new Set();
    for (let frame = 0; frame < CONSTRUCTION_FRAME_COUNT; frame++) {
      const tile = getConstructionFrameRect(frame, width, height);
      assert.equal(tile.sheetIndex, Math.floor(frame / 4));
      assert.ok(tile.sx >= 0 && tile.sy >= 0);
      assert.ok(tile.sx + width <= width * 2 && tile.sy + height <= height * 2);
      tiles.add(`${tile.sheetIndex}:${tile.sx}:${tile.sy}`);
    }
    assert.equal(tiles.size, 336);
    assert.deepEqual(getConstructionFrameRect(335, width, height), {
      sheetIndex: 83, sx: width, sy: height, width, height,
    });
    const before = getConstructionPose(3.5 / 335);
    assert.equal(getConstructionFrameRect(before.frame, width, height).sheetIndex, 0);
    assert.equal(getConstructionFrameRect(before.upperFrame, width, height).sheetIndex, 1);
    assert.equal(before.blend, 0.5);
  }
  assert.deepEqual(getConstructionFrameRect(Infinity), getConstructionFrameRect(0));
  assert.deepEqual(getConstructionFrameRect(-1), getConstructionFrameRect(0));
  assert.deepEqual(getConstructionFrameRect(999), getConstructionFrameRect(335));
});
