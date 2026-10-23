import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reconcileLayout,moveSlot} from '../../src/domain/inventory';
import {safeImage,safeUrl} from '../../src/lib/urls';
test('saved inventory reconciles duplicates, deleted IDs and new records without truncating projects',()=>{
 const ids=Array.from({length:31},(_,i)=>'p'+i);
 const result=reconcileLayout(['p2','missing','p2',null,'p0'],ids);
 assert.equal(result.length,36);assert.equal(result[0],'p2');assert.equal(result[4],'p0');
 assert.equal(new Set(result.filter(Boolean)).size,31);assert.equal(result.filter(Boolean).length,31);
 assert.equal(reconcileLayout({fake:'object'},['p1']).filter(Boolean).length,1);
});
test('move, swap and invalid moves preserve the input and item counts',()=>{
 const initial=reconcileLayout(null,['one','two']);
 const moved=moveSlot(initial,0,25);assert.equal(moved[25],'one');assert.equal(moved[0],null);
 const swapped=moveSlot(moved,25,1);assert.equal(swapped[1],'one');assert.equal(swapped[25],'two');
 assert.equal(initial[0],'one');assert.deepEqual(moveSlot(initial,-1,0),initial);
 assert.deepEqual(moveSlot(initial,0,.5),initial);
});
test('URL helpers reject executable and traversal sources while preserving allowed images and links',()=>{
 assert.equal(safeUrl('javascript:alert(1)'), '');
 assert.equal(safeUrl('mailto:owner@example.com',false),'');
 assert.equal(safeUrl('mailto:owner@example.com'),'mailto:owner@example.com');
 assert.equal(safeImage('assets/../private.png'),'');
 assert.equal(safeImage('assets/demos/project-1-1.svg'),'/assets/demos/project-1-1.svg');
 assert.equal(safeImage('data:image/svg+xml;base64,PHN2Zz4='),'');
 assert.equal(safeImage('https://example.com/portrait.jpg'),'https://example.com/portrait.jpg');
});
