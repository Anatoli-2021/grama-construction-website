import { normalizeProjectId } from '../../../packages/shared/project-id.mjs';

// Adapted from the existing 1.0-pilot export builder; project data stays local.
export function buildLaunch(tpl, input) {
 input = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
 input.project_id = normalizeProjectId(input.project_id);
 for (const key of tpl.requiredForReview) if (typeof input[key] !== 'string' || !input[key]) throw new Error('Please complete: ' + key.replaceAll('_', ' '));
 if (!['Single home', 'Subdivision', 'Redevelopment', 'Renovation', 'Land opportunity'].includes(input.project_type)) throw new Error('Select a valid opportunity type.');
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.pm_email)) throw new Error('Enter a valid project manager email.');

 const tasks=tpl.tasks.filter(t=>t.appliesTo==='All'||input.project_type==='Subdivision').map(t=>structuredClone(t));
 if(input.project_type==='Subdivision'){
  tasks.find(t=>t.key==='T13').dependsOn.push('S01');
  tasks.find(t=>t.key==='T16').dependsOn.push('S02');
  tasks.find(t=>t.key==='T19').dependsOn.push('S01');
 }
 const projectId=input.project_id.trim(),id=k=>projectId+'-'+k;
 const planRows=tasks.map(t=>({
  'Task':t.task,'Task ID':id(t.key),'Project ID':projectId,
  'Proposed Responsible Role':t.proposedRole,'Responsible':null,
  'Accountable Role':input.pm_name+' — PM','Status':'Draft',
  'Expected Result':t.definitionOfDone,'Definition of Done':t.definitionOfDone,
  'Approval Needed':t.approvalGate,'Depends On / Gate':t.dependsOn.map(id).join('; '),
  'Due Date':null,'Next Follow-Up':null,'Date Confidence':'Unconfirmed',
  'Source IDs / Link':projectId+'-SRC-01','Evidence Link':null
 }));
 const gaps=['Verify existing Project ID/aliases and site identity','Check source contents, revision, scope and authority','Confirm task owners and dates/follow-ups','Verify approval before each commitment','Appoint construction roles before release'];
 for(const key of ['entity_and_ownership','area_units_and_plan_revision','known_constraints','funding_source','market_basis','access_audience'])if(!input[key])gaps.push('Missing: '+key.replaceAll('_',' '));
 return {
  template:tpl.name,version:tpl.version,project:input,status:'Draft for human review',
  existingRecordMap:{sourceMap:input.existing_source_map_url||null,plan:input.existing_plan_url||null,controls:input.existing_controls_url||null},
  sourceMapRows:[{'Source':input.source_reference,'Source ID':projectId+'-SRC-01','Project ID':projectId,'URL / Path':input.source_reference,'Source Date / Revision':input.source_asof||'Unconfirmed','Verification Status':'Draft reference','Authority / Limitation':'User-supplied source. Contents and approval not verified.','Access Class':'Project'}],
  planRows,
  controlsRows:tasks.map(t=>({'Control / Action':'Release gate: '+t.task,'Control ID':projectId+'-G-'+t.key,'Project ID':projectId,'Phase':t.phase,'Record Type':'Approval','Status':'Draft','Responsible':null,'Approval Needed':t.approvalGate,'Definition of Done':t.definitionOfDone,'Depends On / Gate':id(t.key),'Date Confidence':'Unconfirmed','Evidence Link':null})),
  costLineTemplate:structuredClone(tpl.costLineTemplate),financeRules:tpl.financeRules,
  agentTaskBrief:structuredClone(tpl.agentTaskBrief),missingInformation:gaps,
  provisioning:'No live action authorized by this export. Map stable keys to existing records, show exact diff, obtain approval, write once and read back.'
 };
}
