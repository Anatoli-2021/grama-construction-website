import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildLaunch } from '../src/launch.mjs';

const tpl = JSON.parse(await readFile(new URL('../launch-template.json', import.meta.url)));
const input = { project_id: 'DEMO-ONLY', opportunity_description: 'Synthetic developer test', project_type: 'Single home', pm_name: 'Demo Reviewer', pm_email: 'reviewer@example.invalid', source_reference: 'Synthetic source, no live project' };

test('blank template has unique tasks, complete acyclic dependencies and no private records', () => {
  assert.equal(tpl.tasks.length, 29);
  assert.equal(new Set(tpl.tasks.map(t => t.key)).size, 29);
  assert.ok(Object.values(tpl.intakeFields).every(value => value === ''));
  assert.ok(tpl.tasks.every(t => t.responsible === null && t.dueDate === null && t.evidence === null));
  const visit = (key, path = []) => {
    assert.ok(!path.includes(key), 'Cyclic task dependency');
    const task = tpl.tasks.find(t => t.key === key);
    assert.ok(task, 'Missing dependency ' + key);
    task.dependsOn.forEach(dep => visit(dep, [...path, key]));
  };
  tpl.tasks.forEach(t => visit(t.key));
});

test('single-home launch preserves all 27 tasks and draft authority boundaries', () => {
  const draft = buildLaunch(tpl, input);
  assert.equal(draft.planRows.length, 27);
  assert.equal(draft.controlsRows.length, 27);
  assert.equal(draft.sourceMapRows.length, 1);
  assert.ok(draft.planRows.every(t => t.Status === 'Draft' && t.Responsible === null && t['Due Date'] === null && t['Evidence Link'] === null));
  assert.equal(draft.costLineTemplate.actualIncurred, null);
  assert.match(draft.provisioning, /No live action authorized/);
});

test('subdivision adds shared infrastructure/allocation gates without changing the template', () => {
  const before = JSON.stringify(tpl);
  const draft = buildLaunch(tpl, { ...input, project_type: 'Subdivision' });
  assert.equal(draft.planRows.length, 29);
  for (const [task, dependency] of [['T13', 'S01'], ['T16', 'S02'], ['T19', 'S01']]) {
    assert.ok(draft.planRows.find(t => t['Task ID'] === 'DEMO-ONLY-' + task)['Depends On / Gate'].includes('DEMO-ONLY-' + dependency));
  }
  assert.equal(JSON.stringify(tpl), before);
  assert.deepEqual(buildLaunch(tpl, input), buildLaunch(tpl, input));
});

test('whitespace-only and unsafe Project IDs cannot produce unusable row keys', () => {
  for (const project_id of ['   ', '../secret', '<script>', 'a'.repeat(81)]) assert.throws(() => buildLaunch(tpl, { ...input, project_id }), /Project ID/);
  const draft = buildLaunch(tpl, { ...input, project_id: '  DEMO-ONLY  ' });
  assert.equal(draft.project.project_id, 'DEMO-ONLY');
  assert.equal(input.project_id, 'DEMO-ONLY');
  assert.equal(draft.planRows[0]['Task ID'], 'DEMO-ONLY-T01');
});

test('required fields, opportunity type and manager email are validated before export', () => {
  for (const field of tpl.requiredForReview.filter(f => f !== 'project_id')) assert.throws(() => buildLaunch(tpl, { ...input, [field]: ' ' }));
  assert.throws(() => buildLaunch(tpl, { ...input, project_type: 'Unknown' }));
  assert.throws(() => buildLaunch(tpl, { ...input, pm_email: 'invalid' }));
});
