import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {siteRoutes} from '../../src/site-routes.js';
import {projects} from '../../src/data/projects.js';
import {readEnquiryContext} from '../../src/enquiry-context.js';
const manifest=JSON.parse(await readFile('docs/original-assets.json','utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('the complete original image/font/plan register and restored hero retain their verified bytes',async()=>{
  assert.equal(manifest.originalAssets.length,31);
  for(const asset of [...manifest.originalAssets,manifest.restoredHero]){
    assert.equal(hash(await readFile(asset.path)),asset.sha256,asset.path);
  }
});

test('Nail’s animation implementation and existing media remain unchanged at the production checkpoint',async()=>{
  assert.equal(manifest.protectedAnimationFiles.length,17);
  for(const asset of manifest.protectedAnimationFiles)assert.equal(hash(await readFile(asset.path)),asset.sha256,asset.path);
});

test('the company homepage uses only original photographs, the supplied plan and approved brand assets',async()=>{
  const html=await readFile('dist/index.html','utf8');
  assert.match(html,/class="hero-image" src="\/assets\/original-home-hero\.webp"/);
  assert.match(html,/property="og:image" content="[^"]*\/assets\/original-home-hero\.webp"/);
  assert.ok(!/<video\b/.test(html),'No AI house film may replace original company photography');
  assert.ok(!/src="\/assets\/(?:residence|community|sequence\/|animated\/)/.test(html));
  const allowed=new Set([...manifest.originalAssets,manifest.restoredHero].map(asset=>'/'+asset.path.replace(/^public\//,'')));
  for(const [,src] of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g))assert.ok(allowed.has(src)||src.startsWith('/assets/brand/'),'Unregistered homepage image: '+src);
  assert.ok(html.includes('href="/animated-experience"'));
  assert.ok(html.includes('href="/projects/dexter-acres"'));
});

test('all completed cases preserve their photographs, original attribution and distinct enquiry paths',async()=>{
  for(const project of projects){
    const html=await readFile('dist/projects/'+project.slug+'/index.html','utf8');
    for(const photo of project.gallery)assert.ok(html.includes('src="/assets/'+photo.image+'"'),project.slug+'/'+photo.image);
    assert.ok(html.includes('href="'+project.source+'"'),project.slug+' attribution');
    for(const [label,expected] of [['Discuss a custom home',{path:'home',topic:'Custom home'}],['Discuss a development',{path:'development',topic:'Development partnership'}]]){
      const anchor=[...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].find(match=>match[2].replace(/<[^>]+>/g,'').trim()===label);
      assert.ok(anchor,project.slug+'/'+label);
      assert.deepEqual(readEnquiryContext(new URL(anchor[1].replace(/&amp;/g,'&'),'https://example.invalid').search),expected);
    }
  }
});

test('all existing public routes and the private presentation shell use Grama Development identity',async()=>{
  assert.equal(siteRoutes.length,15);
  for(const route of siteRoutes){
    const html=await readFile(route.path==='/'?'dist/index.html':'dist'+route.path+'/index.html','utf8');
    assert.ok(route.title.includes('Grama Development'),route.path);
    assert.ok(html.includes('src="/assets/brand/grama-development.svg"'),route.path);
    assert.ok(!/<title>[^<]*(?:Grama Construction|Groma)/i.test(html),route.path);
  }
  assert.match(await readFile('dist/presentation/index.html','utf8'),/<title>Private presentation — Grama Development<\/title>/);
});
