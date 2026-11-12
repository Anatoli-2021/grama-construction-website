import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
import { buildLaunch } from '../../apps/development-os/src/launch.mjs';
// Manual synthetic review harness, not a browser or hosted-authorization test.
// Run only on explicitly reviewed repository code; node:vm is not a security boundary.
const args=process.argv.slice(2);
const arg=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const sourcePath=arg('--source'), expectedBlob=arg('--expected-blob'), sourceCommit=arg('--commit');
if(!sourcePath||!expectedBlob||!sourceCommit)throw Error('Required: --source <reviewed Studio HTML> --expected-blob <Git blob SHA> --commit <reviewed commit SHA>');
const bytes=fs.readFileSync(sourcePath);
const actualBlob=crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes])).digest('hex');
if(actualBlob!==expectedBlob)throw Error('Source does not match the explicitly reviewed Git blob; refusing to run.');
const html=bytes.toString('utf8');
const manifestPath=arg('--asset-manifest');
const assets=[];
let scripts;
if(manifestPath){
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const entries=[...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(m=>m[1]);
  const sheets=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"\s*>/g)].map(m=>m[1]);
  if(!entries.length||/<script>/.test(html))throw Error('Expected explicitly reviewed external scripts only.');
  scripts=[];
  for(const name of [...entries,...sheets]){
    if(!/^[A-Za-z0-9_-]+\.(js|css)$/.test(name)||typeof manifest[name]!=='string')throw Error('Unreviewed or unsafe asset reference: '+name);
    const content=fs.readFileSync(path.join(path.dirname(sourcePath),name));
    const sha=crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+content.length+'\0'),content])).digest('hex');
    if(sha!==manifest[name])throw Error('Asset does not match reviewed Git blob: '+name);
    assets.push({path:name,gitBlobSHA:sha});
    if(entries.includes(name))scripts.push({name,source:content.toString('utf8')});
  }
}else{
  const match=html.match(/<script>([\s\S]*?)<\/script>/);
  if(!match)throw Error('External Studio requires --asset-manifest with reviewed JS/CSS Git blob identities.');
  scripts=[{name:sourcePath,source:match[1]}];
}
const elements=new Map(), handlers=new Map(), saved=new Map(), blobs=new Map(), downloads=[];
const element=id=>{if(!elements.has(id))elements.set(id,{id:id.replace(/^#/,''),value:'',textContent:'',innerHTML:'',hidden:false,files:[],style:{},classList:{add(){},remove(){},toggle(){}},focus(){},setSelectionRange(){},scrollIntoView(){},addEventListener(){}});return elements.get(id);};
class SafeURL extends URL {static createObjectURL(blob){const id='blob:qa-'+blobs.size;blobs.set(id,blob);return id;}static revokeObjectURL(){}}
const document={querySelector:element,querySelectorAll(){return [];},addEventListener(type,handler){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(handler);},createElement(){return{click(){downloads.push({name:this.download,blob:blobs.get(this.href)});},remove(){}};},body:{appendChild(){}},documentElement:{dataset:{}}};
const context=vm.createContext({document,console,URL:SafeURL,URLSearchParams,Blob,File,location:{search:'',hash:''},history:{replaceState(){}},scrollTo(){},window:{open(){}},navigator:{clipboard:{async writeText(){}}},matchMedia(){return{matches:false};},confirm(){return false;},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},indexedDB:{open(){throw Error('QA memory fallback; browser persistence is not tested');}}});
for(const script of scripts)await vm.runInContext(script.source,context,{timeout:1500,filename:script.name});
const run=code=>vm.runInContext(code,context,{timeout:1500});
const results=[];
function check(id,condition,detail){results.push({id,result:condition?'PASS':'FAIL',detail});}
function submit(id){for(const handler of handlers.get('submit')||[])handler({preventDefault(){},target:{id}});}
async function click(act,extra={}){for(const handler of handlers.get('click')||[])await handler({target:{closest(){return{dataset:{act,...extra}};}}});}
function fill(fields){for(const [id,value]of Object.entries(fields))element('#'+id).value=String(value);}
const snapshot=()=>JSON.parse(run('JSON.stringify(state)'));
const hasDailyWorkspace=run('typeof viewDaily === "function"');
if(hasDailyWorkspace){fill({n_addr:'DEMO QA Project — synthetic kitchen',n_type:'Development — single home',n_client:'',n_src:'',n_desc:''});submit('newdev');}
else{fill({np_addr:'DEMO QA Project — synthetic kitchen',np_type:'Renovation'});submit('newproj');}
check('FLOW-01',run("P().address === 'DEMO QA Project — synthetic kitchen' && P().selections.length === 0"),'Actual submit handler creates a separate synthetic project with empty selections.');
check('FLOW-02',run('P().areas.some(a=>a.name==="Kitchen")'),'Kitchen design area exists; metadata is project-scoped.');
fill({s_name:'DEMO cabinets',s_cat:'Cabinets',s_vendor:'DEMO supplier',s_spec:'DEMO shaker cabinets; illustrative only',s_qty:2,s_unit:'EA',s_cost:100,s_code:'DEMO-6400',s_need:'',s_conf:''});submit('selform');
check('FLOW-03',run('outRows(P(),"budget").length===0'),'Discussed selections do not feed budget output.');
let id=run('P().selections[0].id');await click('next',{id});
check('FLOW-04',run('P().selections[0].status==="Selected" && outRows(P(),"budget").length===0'),'Selected items wait for a demo approval before output.');
await click('next',{id});
check('FLOW-05',run('P().selections[0].status==="Approved" && outRows(P(),"budget")[0][5]===200'),'Demo approval feeds 2 × 100 = 200 into a budget draft; all amounts are fictional test input.');
element('#f_cat').value='Drawing';
await run('addFiles([new File(["DEMO drawing; not for construction"],"DEMO-drawing.txt",{type:"text/plain"})])');
check('FLOW-06',run('P().files.some(f=>f.cat==="Drawing") && blockers(P()).length===0'),'A synthetic drawing plus complete selection clears the prototype metadata blocker list.');
await click('out',{v:'tasks'});await click('dl',{k:'tasks'});
const taskDownload=downloads.find(d=>d.name.endsWith('.json'));
const packageData=JSON.parse(await taskDownload.blob.text());
check('FLOW-07',packageData.tasks.length===1&&packageData.tasks[0].status==='Draft'&&packageData.tasks[0].responsible===null&&packageData.tasks[0].dueDate===null,'Actual download handler produces a Draft contractor task with no invented owner/deadline.');
const originalTaskKey=packageData.tasks[0].key;
let dailyContextWorks=false;
if(hasDailyWorkspace){
  const projectID=run('P().id');
  await click('view',{v:'daily'});
  fill({t_text:'DEMO project follow-up',t_kind:'Follow-up',t_proj:projectID,t_due:'',t_conf:''});submit('newtask');
  const dailyHTML=run('viewDaily()');
  await click('goto',{id:projectID,n:'5'});
  dailyContextWorks=dailyHTML.includes('DEMO project follow-up')&&dailyHTML.includes('data-id="'+projectID+'"')&&run('P().id')===projectID&&run('state.view')==='studio'&&run('P().step')===5;
}
check('FLOW-08',dailyContextWorks,'Daily Workspace must show the project-linked action and return to the same project/budget step; passing is prototype logic only, not hosted/live Dashboard integration.');
check('FLOW-09',packageData.tasks[0].dependsOn.length>0,'Draft contractor tasks require explicit predecessor/release references; no work is released.');
await click('edit',{id});fill({s_name:'DEMO cabinets',s_cat:'Cabinets',s_vendor:'DEMO supplier',s_spec:'DEMO revised shaker',s_qty:3,s_unit:'EA',s_cost:125,s_code:'DEMO-6400',s_need:'',s_conf:''});submit('selform');
check('REV-01',run('P().selections[0].rev===2 && P().selections[0].status==="Selected" && outRows(P(),"budget").length===0'),'Editing an approved item creates R2, retains R1 history and removes the changed item from approved outputs pending reapproval.');
check('REV-02',run('P().selections[0].history[0].unitCost===100 && P().selections[0].history[0].costCode==="DEMO-6400"'),'Prior approved history must preserve the actual former unit cost and cost code.');
await click('next',{id});await click('out',{v:'budget'});
check('TRACE-01',run('OUT.budget[1].some(c=>/project.?id/i.test(c)) && OUT.budget[1].some(c=>/selection.?id/i.test(c)) && OUT.budget[1].some(c=>/revision/i.test(c))'),'Budget export must carry project ID, selection ID and approved revision.');
fill({s_name:'DEMO another item',s_cat:'Cabinets',s_vendor:'DEMO supplier',s_spec:'Synthetic only',s_qty:1,s_unit:'EA',s_cost:10,s_code:'DEMO-6400',s_need:'',s_conf:''});submit('selform');
const insertedID=run('P().selections.at(-1).id');await click('next',{id:insertedID});await click('next',{id:insertedID});
run('P().selections.unshift(P().selections.pop())');
check('ID-01',run('outRows(P(),"tasks").find(r=>r[1].includes("DEMO cabinets"))[0]')===originalTaskKey,'Existing logical task identity must survive inserting another approved item; no particular key format is assumed.');
check('CSV-01',!run('csv([["=1+1"]])').startsWith('='),'Formula-leading text must be neutralized in spreadsheet-facing CSV. No formula is executed.');
run('P().selections[0].unitCost=null');
check('UNKNOWN-01',run('outRows(P(),"budget").some(r=>r[5]==="")'),'Missing cost remains unknown/blank, not zero.');
check('DATE-01',packageData.tasks.every(t=>t.dueDate===null&&t.responsible===null),'Draft export does not invent assignments or dates.');
check('HTML-01',run('esc("<img onerror=x>")==="&lt;img onerror=x&gt;"'),'The prototype escapes text containing HTML.');
if(run('typeof importLaunch === "function"')){
  const tasks=JSON.parse(run('taskJson(P())')).tasks;
  const checklistIDs=new Set(snapshot().projects.find(p=>p.id===run('P().id')).checklist.map(c=>c.id));
  check('DEP-01',tasks.every(t=>t.dependsOn.every(d=>checklistIDs.has(d)||tasks.some(other=>other.taskId===d))&&t.releaseStatus==='Not released'),'Single-home dependency IDs must resolve to real checklist/package tasks and remain unreleased.');
  check('ID-02',new Set(tasks.map(t=>t.taskId)).size===tasks.length&&new Set(tasks.map(t=>t.selectionId)).size===tasks.length,'Actual form-created selections produce unique stable global task and selection IDs.');
  check('CSV-02',['=1+1',' +1','-1','@SUM(A1)','\ttext','\rtext'].every(value=>{const cell=run('csvCell('+JSON.stringify(value)+')');return(cell.startsWith('"')?cell.slice(1,-1).replaceAll('""','"'):cell).startsWith("'");})&&run('csvCell(-2)')==='-2','Dangerous text markers are quoted as text; typed numeric values remain numbers. Consumer/resave behavior is not tested.');
  const tpl=JSON.parse(fs.readFileSync(new URL('../../apps/development-os/launch-template.json',import.meta.url),'utf8'));
  const draft=buildLaunch(tpl,{project_id:'DEMO-IMPORT-QA',opportunity_description:'Synthetic launch integration test',project_type:'Subdivision',pm_name:'Demo Reviewer',pm_email:'reviewer@example.invalid',source_reference:'Synthetic source only'});
  const imported=run('importLaunch('+JSON.stringify(draft)+')');
  const importedProject=JSON.parse(run('JSON.stringify(P())'));
  check('IMPORT-01',imported===''&&importedProject.id===draft.project.project_id&&importedProject.checklist.length===29&&draft.planRows.every(row=>importedProject.checklist.some(c=>c.id===row['Task ID']&&c.dependsOn===row['Depends On / Gate'])),'Import the actual reusable launch builder output: preserve subdivision Project ID, all 29 task IDs and dependencies. This is logic, not a browser upload or shared store.');
  const count=run('state.projects.length');const duplicate=run('importLaunch('+JSON.stringify(draft)+')');
  check('IMPORT-02',duplicate!==''&&run('state.projects.length')===count,'Repeated launch import must not create a duplicate Project ID.');
  fill({n_addr:'DEMO renovation dependency QA',n_type:'Construction or renovation',n_id:'DEMO-RENO-QA',n_client:'',n_src:'',n_desc:''});submit('newdev');
  fill({s_name:'DEMO renovation cabinets',s_cat:'Cabinets',s_vendor:'DEMO supplier',s_spec:'Synthetic only',s_qty:1,s_unit:'EA',s_cost:10,s_code:'DEMO-6400',s_need:'',s_conf:''});submit('selform');
  const renoID=run('P().selections[0].id');await click('next',{id:renoID});await click('next',{id:renoID});
  const renovation=JSON.parse(run('taskJson(P())')), renoChecklist=new Set(JSON.parse(run('JSON.stringify(P().checklist)')).map(c=>c.id));
  check('DEP-02',renovation.tasks.length>0&&renovation.tasks.every(t=>t.dependsOn.every(d=>renoChecklist.has(d)||renovation.tasks.some(other=>other.taskId===d))),'Quick-created renovation must contain its referenced contract/release gate tasks; dangling predecessors are a setup defect, not satisfied gates.');
  if(assets.length){
    const savedChecklist=run('JSON.stringify(P().checklist)');
    run('P().checklist=P().checklist.filter(c=>c.key!=="T17")');
    let before=downloads.length;await click('dl',{k:'tasks'});
    check('DEP-03',downloads.length===before,'Missing contract authority T17 must block actual export, not silently remove the approval gate from dependencies.');
    run('P().checklist='+savedChecklist);
    fill({s_name:'DEMO unapproved predecessor',s_cat:'Cabinets',s_vendor:'DEMO supplier',s_spec:'Synthetic only',s_qty:1,s_unit:'EA',s_cost:10,s_code:'DEMO-6400',s_need:'',s_conf:'',s_src:'',s_after:''});submit('selform');
    run('P().selections[0].after=[P().selections.at(-1).id]');
    before=downloads.length;await click('dl',{k:'tasks'});
    let valid=true;
    if(downloads.length>before){const pack=JSON.parse(await downloads.at(-1).blob.text());const ids=new Set([...JSON.parse(savedChecklist).map(c=>c.id),...pack.tasks.map(t=>t.taskId)]);valid=pack.tasks.every(t=>t.dependsOn.every(id=>ids.has(id)));}
    check('DEP-04',valid,'An unapproved predecessor must not create a dangling contractor task reference; block export or require the predecessor approval.');
  }
}
const output={date:new Date().toISOString(),source:{branch:'claude/design-studio-prototype',commit:sourceCommit,gitBlobSHA:actualBlob,localSHA256:crypto.createHash('sha256').update(html).digest('hex'),assets},method:'Unmodified reviewed scripts in restricted Node vm; actual form/click/download handlers plus actual launch builder import; synthetic inputs; minimal DOM/storage stubs; no network, browser or live systems.',limits:['Not a browser/visual test','Not browser persistence or IndexedDB durability','Not hosted authentication/authorization','Launch import is logic only, not browser upload or a shared project store','Not Smartsheet/Wave/company data','No release approval or live contractor package'],summary:{pass:results.filter(r=>r.result==='PASS').length,fail:results.filter(r=>r.result==='FAIL').length,overall:results.some(r=>r.result==='FAIL')?'FAIL — complete integrated workflow not ready':'PASS — logic harness only; browser and hosted checks still required'},results};
const outputDir=path.resolve('evidence','studio-qa');
fs.mkdirSync(outputDir,{recursive:true});
fs.writeFileSync(path.join(outputDir,'workflow-results.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
process.exitCode=results.some(r=>r.result==='FAIL')?1:0;
