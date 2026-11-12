import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
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
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements=new Map(), handlers=new Map(), saved=new Map(), blobs=new Map(), downloads=[];
const element=id=>{if(!elements.has(id))elements.set(id,{id:id.replace(/^#/,''),value:'',textContent:'',innerHTML:'',hidden:false,files:[],style:{},classList:{add(){},remove(){},toggle(){}},focus(){},setSelectionRange(){},scrollIntoView(){},addEventListener(){}});return elements.get(id);};
class SafeURL extends URL {static createObjectURL(blob){const id='blob:qa-'+blobs.size;blobs.set(id,blob);return id;}static revokeObjectURL(){}}
const document={querySelector:element,querySelectorAll(){return [];},addEventListener(type,handler){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(handler);},createElement(){return{click(){downloads.push({name:this.download,blob:blobs.get(this.href)});},remove(){}};},body:{appendChild(){}},documentElement:{dataset:{}}};
const context=vm.createContext({document,console,URL:SafeURL,URLSearchParams,Blob,File,location:{search:''},window:{open(){}},navigator:{clipboard:{async writeText(){}}},matchMedia(){return{matches:false};},confirm(){return false;},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},indexedDB:{open(){throw Error('QA memory fallback; browser persistence is not tested');}}});
await vm.runInContext(source,context,{timeout:1500});
const run=code=>vm.runInContext(code,context,{timeout:1500});
const results=[];
function check(id,condition,detail){results.push({id,result:condition?'PASS':'FAIL',detail});}
function submit(id){for(const handler of handlers.get('submit')||[])handler({preventDefault(){},target:{id}});}
async function click(act,extra={}){for(const handler of handlers.get('click')||[])await handler({target:{closest(){return{dataset:{act,...extra}};}}});}
function fill(fields){for(const [id,value]of Object.entries(fields))element('#'+id).value=String(value);}
const snapshot=()=>JSON.parse(run('JSON.stringify(state)'));
fill({np_addr:'DEMO QA Project — synthetic kitchen',np_type:'Renovation'});submit('newproj');
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
await click('out',{v:'tasks'});await click('dl');
const taskDownload=downloads.find(d=>d.name.endsWith('.json'));
const packageData=JSON.parse(await taskDownload.blob.text());
check('FLOW-07',packageData.tasks.length===1&&packageData.tasks[0].status==='Draft'&&packageData.tasks[0].responsible===null&&packageData.tasks[0].dueDate===null,'Actual download handler produces a Draft contractor task with no invented owner/deadline.');
check('FLOW-08',!run('viewInfo("today").includes("separate private prototype")'),'FAIL: Today is a placeholder navigation explanation, not an integrated project dashboard.');
check('FLOW-09',packageData.tasks[0].dependsOn.length>0,'FAIL: exported contractor tasks have no predecessor/dependency links; this is not a released work package.');
await click('edit',{id});fill({s_name:'DEMO cabinets',s_cat:'Cabinets',s_vendor:'DEMO supplier',s_spec:'DEMO revised shaker',s_qty:3,s_unit:'EA',s_cost:125,s_code:'DEMO-6400',s_need:'',s_conf:''});submit('selform');
check('REV-01',run('P().selections[0].rev===2 && P().selections[0].status==="Selected" && outRows(P(),"budget").length===0'),'Editing an approved item creates R2, retains R1 history and removes the changed item from approved outputs pending reapproval.');
check('REV-02',run('Object.hasOwn(P().selections[0].history[0],"unitCost") && Object.hasOwn(P().selections[0].history[0],"costCode")'),'FAIL: saved approval history omits the old unit cost and cost code.');
await click('next',{id});await click('out',{v:'budget'});
check('TRACE-01',run('OUT.budget[1].some(c=>/revision|selection id/i.test(c))'),'FAIL: budget export has no selection ID/revision column despite the interface claiming each line carries its revision.');
run('P().selections.unshift({...P().selections[0],id:"qa-earlier-selection",name:"DEMO another item",rev:1,history:[]})');
check('ID-01',run('outRows(P(),"tasks").find(r=>r[1].includes("DEMO cabinets"))[0]==="DS-01"'),'FAIL: adding an approved item before an existing item changes that item task key from DS-01 to DS-02.');
check('CSV-01',!run('csv([["=1+1"]])').startsWith('='),'FAIL: CSV preserves a leading spreadsheet formula marker in text cells. No formula was executed.');
run('P().selections[0].unitCost=null');
check('UNKNOWN-01',run('outRows(P(),"budget").some(r=>r[5]==="")'),'Missing cost remains unknown/blank, not zero.');
check('DATE-01',packageData.tasks.every(t=>t.dueDate===null&&t.responsible===null),'Draft export does not invent assignments or dates.');
check('HTML-01',run('esc("<img onerror=x>")==="&lt;img onerror=x&gt;"'),'The prototype escapes text containing HTML.');
const output={date:new Date().toISOString(),source:{branch:'claude/design-studio-prototype',commit:sourceCommit,gitBlobSHA:actualBlob,localSHA256:crypto.createHash('sha256').update(html).digest('hex')},method:'Unmodified committed script in restricted Node vm; actual form/click/download handlers; synthetic inputs; minimal DOM/storage stubs; no network, browser or live systems.',limits:['Not a browser/visual test','Not browser persistence or IndexedDB durability','Not hosted authentication/authorization','Not launch-tool-to-Studio project ID integration','Not Smartsheet/Wave/company data','No release approval or live contractor package'],summary:{pass:results.filter(r=>r.result==='PASS').length,fail:results.filter(r=>r.result==='FAIL').length,overall:results.some(r=>r.result==='FAIL')?'FAIL — complete integrated workflow not ready':'PASS — logic harness only; browser and hosted checks still required'},results};
const outputDir=path.resolve('evidence','studio-qa');
fs.mkdirSync(outputDir,{recursive:true});
fs.writeFileSync(path.join(outputDir,'workflow-results.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
process.exitCode=results.some(r=>r.result==='FAIL')?1:0;
