import { buildLaunch } from './launch.mjs';
const template = JSON.parse(document.getElementById('template-data').textContent);
const form = document.getElementById('launch');
const result = document.getElementById('result');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  try {
    const draft = buildLaunch(template, Object.fromEntries(new FormData(form)));
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = draft.project.project_id + '-launch-DRAFT.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    result.textContent = `Exported ${draft.planRows.length} Draft tasks and ${draft.controlsRows.length} approval gates. No Smartsheet changes. ${draft.missingInformation.length} checks or missing-information items remain.`;
  } catch (error) { result.textContent = error.message; form.elements.project_id.focus(); }
});
