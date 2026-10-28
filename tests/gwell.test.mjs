import test from "node:test";
import assert from "node:assert/strict";
import {GEOMETRY,hysteresis,replay,firstDifference,shellAccounting,causalHorizon,newLedger,record,recovery} from "../src/gwell.mjs";

test("3:1 structure",()=>{assert.equal(GEOMETRY.shells,3);assert.equal(GEOMETRY.inner,1);assert.equal(GEOMETRY.token,"-U+")});
test("memory and replay",()=>{
  const events=[.9,.5,.2,.8,.4,.1].map(drive=>({drive}));
  assert.deepEqual(replay(0,events).states,[0,1,1,0,1,1,0]);
  assert.equal(hysteresis(1,.5),1);
});
test("first difference",()=>assert.deepEqual(firstDifference([0,1,1],[0,1,0]),{cycle:2,a:1,b:0}));
test("shell conservation",()=>{
  const out=shellAccounting(100,[{tau:.8,rho:.1},{tau:.75,rho:.15},{tau:.5,rho:.2}]);
  assert.ok(Math.abs(out.total-100)<1e-9);
});
test("finite causal horizon",()=>{
  assert.equal(causalHorizon([0,0],[2,2],3),false);
  assert.equal(causalHorizon([0,0],[2,2],4),true);
});
test("dispute isolation and append-only recovery",()=>{
  const l=newLedger();
  record(l,{id:"a",drive:.9});
  record(l,{id:"b",drive:.1,disputed:true});
  record(l,{id:"c",drive:.1,dependsOn:["b"]});
  assert.equal(l.state,1);
  assert.equal(l.history[1].status,"quarantined");
  assert.equal(l.history[2].status,"quarantined");
  recovery(l,{id:"r1",disputeId:"b",evidence:"independent trace reference",decision:"reject"});
  assert.equal(l.state,1);
  assert.equal(l.history[1].status,"quarantined");
  assert.equal(l.history.length,4);
});
