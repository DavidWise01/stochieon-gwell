// GWELL 062: deterministic six-chamber persistence with canonical frame.
export const FRAME = Object.freeze(["a1","b1","c1","abc2","0"]);
export const PHASES = Object.freeze(["past","present","future","future","present","past"]);
export const KEY = "stochieon.gwell062.wankel.v1";
export function genesis(){return {schema:1,frame:[...FRAME],tick:0,chambers:[0,1,2,3,4,5],events:[]}}
export function step(state){
 validate(state);
 const next=state.chambers.map((_,i)=>state.chambers[(i+5)%6]);
 const tick=state.tick+1;
 return {schema:1,frame:[...FRAME],tick,chambers:next,events:[...state.events,{tick,phase:[...PHASES],chambers:[...next]}]};
}
export function replay(events){
 let s=genesis();
 for(const e of events){s=step(s);if(e.tick!==s.tick||JSON.stringify(e.chambers)!==JSON.stringify(s.chambers))throw Error("first divergence at tick "+s.tick)}
 return s;
}
export function validate(s){
 if(!s||s.schema!==1||JSON.stringify(s.frame)!==JSON.stringify(FRAME)||!Number.isSafeInteger(s.tick)||s.tick<0)throw Error("invalid frame");
 if(!Array.isArray(s.chambers)||s.chambers.length!==6||new Set(s.chambers).size!==6||s.chambers.some(v=>!Number.isInteger(v)||v<0||v>5))throw Error("invalid chambers");
 if(!Array.isArray(s.events)||s.events.length!==s.tick)throw Error("invalid event count");
}
export function encode(s){validate(s);return JSON.stringify(s)}
export function decode(text){const s=JSON.parse(text);validate(s);const r=replay(s.events);if(JSON.stringify(r.chambers)!==JSON.stringify(s.chambers))throw Error("restored state diverged");return s}
export function save(storage,s){storage.setItem(KEY,encode(s));return s.tick}
export function load(storage){const raw=storage.getItem(KEY);return raw===null?null:decode(raw)}

export function bind063(state,values={}){
 const saved=decode(encode(state));
 const witnesses=["a1","b1","c1"].map(id=>({id,tick:saved.tick,status:Object.hasOwn(values,id)?"OBSERVED":"MISSING",value:Object.hasOwn(values,id)?values[id]:null}));
 const complete=witnesses.every(w=>w.status==="OBSERVED");
 const abc2=!complete?"INCOMPLETE":witnesses.every(w=>JSON.stringify(w.value)===JSON.stringify(witnesses[0].value))?"MATCH":"DIVERGENT";
 return {schema:1,frame:[...FRAME],zero:[0,0,0],snapshot:saved,witnesses,abc2};
}
export function restore063(bundle){
 if(!bundle||bundle.schema!==1||JSON.stringify(bundle.zero)!=="[0,0,0]")throw Error("Bad zero anchor");
 const state=decode(JSON.stringify(bundle.snapshot));
 const values={};for(const w of bundle.witnesses||[]){if(w.status==="OBSERVED")values[w.id]=w.value}
 const expected=bind063(state,values);
 if(JSON.stringify(expected)!==JSON.stringify(bundle))throw Error("Witness bundle divergence");
 return state;
}

export function witness064(){return {a1:[],b1:[],c1:[]}}
export function append064(logs,id,tick,value){
 if(!["a1","b1","c1"].includes(id))throw Error("Unknown witness");
 if(!Number.isSafeInteger(tick)||tick<0)throw Error("Bad tick");
 const next=JSON.parse(JSON.stringify(logs)),list=next[id];
 if(list.length&&tick<list[list.length-1].tick)throw Error("Earlier tick");
 list.push({ordinal:list.length+1,tick,value});
 return next;
}
export function compare064(logs,tick){
 const entries=["a1","b1","c1"].map(id=>(logs[id]||[]).filter(e=>e.tick===tick).at(-1));
 const abc2=entries.some(e=>!e)?"INCOMPLETE":entries.every(e=>JSON.stringify(e.value)===JSON.stringify(entries[0].value))?"MATCH":"DIVERGENT";
 return {abc2,entries,zero:[0,0,0]};
}

export const CENTERS065=Object.freeze(["ff","fr","cf","cr","rf","rr"]);
export const CENTER_KEY065="stochieon.gwell065.centers.v1";
export function centers065(){return Object.fromEntries(CENTERS065.map(id=>[id,[]]))}
export function observeReport065(logs,id,tick,observation){
 if(!CENTERS065.includes(id)||!Number.isSafeInteger(tick)||tick<0)throw Error("Invalid report address");
 const next=JSON.parse(JSON.stringify(logs)),list=next[id];
 if(list.length&&tick<list[list.length-1].tick)throw Error("Out-of-order report");
 list.push({seq:list.length+1,tick,observation:JSON.parse(JSON.stringify(observation))});
 return next;
}
export function inspect065(logs,tick){
 const reports=CENTERS065.map(id=>({center:id,record:(logs[id]||[]).filter(x=>x.tick===tick).at(-1)||null}));
 return {tick,origin:[0,0,0],reports,received:reports.filter(x=>x.record).length};
}
export function store065(storage,logs){storage.setItem(CENTER_KEY065,JSON.stringify(logs))}
export function restoreCenters065(storage){
 const raw=storage.getItem(CENTER_KEY065);if(!raw)return centers065();
 const logs=JSON.parse(raw);
 for(const id of CENTERS065){if(!Array.isArray(logs[id]))throw Error("Center ledger absent "+id);
 logs[id].forEach((e,i)=>{if(e.seq!==i+1||!Number.isSafeInteger(e.tick)||(i&&e.tick<logs[id][i-1].tick))throw Error("Invalid center sequence "+id)})}
 return logs;
}

export const DOMAINS066=Object.freeze(["L","C","R"]);
export const ROUTES066=Object.freeze({L:["C"],C:["L","R"],R:["C"]});
export const CENTER_DOMAIN066=Object.freeze({ff:"L",fr:"L",cf:"C",cr:"C",rf:"R",rr:"R"});
export function network066(){return {schema:1,queues:{L:[],C:[],R:[]},delivered:{L:[],C:[],R:[]},sequence:0}}
export function send066(state,from,to,payload){
 if(!DOMAINS066.includes(from)||!ROUTES066[from].includes(to))throw Error("Bridge forbidden");
 const next=JSON.parse(JSON.stringify(state));
 const id=++next.sequence;
 next.queues[to].push({id,from,to,payload:JSON.parse(JSON.stringify(payload))});
 return next;
}
export function receive066(state,domain){
 if(!DOMAINS066.includes(domain))throw Error("Unknown compartment");
 const next=JSON.parse(JSON.stringify(state));
 const packet=next.queues[domain].shift()||null;
 if(packet)next.delivered[domain].push(packet);
 return {state:next,packet};
}

export const TIMING067=Object.freeze({left:[5,5,5,7,7],right:[5,5,7,7,7],offset:{left:2/5,right:3/5}});
export function phase067(side,tick){if(!["left","right"].includes(side))throw Error("Unknown bridge");const seq=TIMING067[side];const pos=((tick%seq.length)+seq.length)%seq.length;return {side,position:pos,duration:seq[pos],phase:(pos+TIMING067.offset[side])%seq.length}}
export function send067(state,from,to,payload,tick){
 const side=(from==="L"||to==="L")?"left":(from==="R"||to==="R")?"right":null;
 if(!side||!ROUTES066[from]?.includes(to))throw Error("No direct bridge");
 const p=phase067(side,tick);
 const next=send066(state,from,to,{...payload,bridge:side,timing:p,origin:payload.origin||from});
 return next;
}

export const CORE068="{{i}}";
export function due068(side,tick){
 const seq=TIMING067[side],shift=side==="left"?2:3;
 if(!seq||!Number.isSafeInteger(tick)||tick<0)throw Error("Bad phase");
 return tick+seq[(tick+shift)%5];
}
export function queue068(state,from,to,payload,tick){
 if(!ROUTES066[from]?.includes(to))throw Error("Forbidden route");
 const side=from==="L"||to==="L"?"left":"right";
 const next=JSON.parse(JSON.stringify(state));
 next.queues[to].push({id:++next.sequence,from,to,origin:payload.origin||from,core:CORE068,due:due068(side,tick),payload});
 return next;
}
export function release068(state,to,tick){
 const next=JSON.parse(JSON.stringify(state)),q=next.queues[to];
 if(!q||!Number.isSafeInteger(tick))throw Error("Bad destination");
 const i=q.findIndex(p=>p.due!==undefined&&p.due<=tick);
 if(i<0)return {state:next,packet:null};
 const packet=q.splice(i,1)[0];next.delivered[to].push(packet);
 return {state:next,packet};
}

export const BRIDGE_KEY069="stochieon.gwell069.bridges.v1";
export function validate069(state){
 if(!state||state.schema!==1||!Number.isSafeInteger(state.sequence)||state.sequence<0)throw Error("Bad bridge header");
 const ids=[];
 for(const d of DOMAINS066){
  if(!Array.isArray(state.queues?.[d])||!Array.isArray(state.delivered?.[d]))throw Error("Missing ledger "+d);
  for(const p of [...state.queues[d],...state.delivered[d]]){
   if(!Number.isSafeInteger(p.id)||p.id<1||p.id>state.sequence||!ROUTES066[p.from]?.includes(p.to)||p.to!==d||p.core!==CORE068||!Number.isSafeInteger(p.due)||p.due<0)throw Error("Invalid packet");
   ids.push(p.id);
  }
 }
 if(new Set(ids).size!==ids.length)throw Error("Duplicate packet ID");
 return true;
}
export function save069(storage,state){validate069(state);storage.setItem(BRIDGE_KEY069,JSON.stringify(state))}
export function load069(storage){const raw=storage.getItem(BRIDGE_KEY069);if(raw===null)return network066();const state=JSON.parse(raw);validate069(state);return state}

export const ATOMIC_KEY070="stochieon.gwell070.atomic.v1";
export function checkpoint070(rotor,centers,bridges){
 const r=decode(encode(rotor));restoreCenters065({getItem:()=>JSON.stringify(centers)});validate069(bridges);
 for(const id of CENTERS065)for(const entry of centers[id])if(entry.tick>r.tick)throw Error("Report ahead of rotor");
 return {schema:70,core:"{{i}}",rotor:r,centers:JSON.parse(JSON.stringify(centers)),bridges:JSON.parse(JSON.stringify(bridges))};
}
export function restore070(storage){
 const raw=storage.getItem(ATOMIC_KEY070);if(raw===null)return null;
 const pack=JSON.parse(raw);if(pack.schema!==70||pack.core!=="{{i}}")throw Error("Invalid atomic header");
 return checkpoint070(pack.rotor,pack.centers,pack.bridges);
}
export function commit070(storage,rotor,centers,bridges){
 const pack=checkpoint070(rotor,centers,bridges);
 storage.setItem(ATOMIC_KEY070,JSON.stringify(pack));
 return pack;
}

export function transition071(storage,current,operation){
 const next=operation(checkpoint070(current.rotor,current.centers,current.bridges));
 if(!next||!next.rotor||!next.centers||!next.bridges)throw Error("Invalid transaction");
 const saved=commit070(storage,next.rotor,next.centers,next.bridges);
 return saved;
}

export function recoveryTest072(){
 const memory=new Map(),storage={getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,v)};
 const base={rotor:genesis(),centers:centers065(),bridges:network066()};
 const old=commit070(storage,base.rotor,base.centers,base.bridges);
 let interrupted=false;
 const failed={getItem:storage.getItem,setItem:()=>{throw Error("simulated interruption")}};
 try{transition071(failed,old,p=>({...p,rotor:step(p.rotor)}))}catch(e){interrupted=true}
 const afterFailure=restore070(storage);
 const unchanged=JSON.stringify(afterFailure)===JSON.stringify(old);
 const next=transition071(storage,old,p=>({...p,rotor:step(p.rotor)}));
 const afterSuccess=restore070(storage);
 const complete=JSON.stringify(next)===JSON.stringify(afterSuccess)&&next.rotor.tick===1;
 return {pass:interrupted&&unchanged&&complete,interrupted,unchanged,complete};
}

export const CHAIN_KEY073="stochieon.gwell073.chain.v1";
export async function hash073(input){
 const data=new TextEncoder().encode(input);
 const digest=await crypto.subtle.digest("SHA-256",data);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export async function verify073(entries){
 let previous="GENESIS";
 for(let i=0;i<entries.length;i++){
  const e=entries[i];
  if(e.previous!==previous||e.ordinal!==i+1||await hash073(previous+"|"+e.snapshot)!==e.hash)throw Error("Chain divergence at "+(i+1));
  previous=e.hash;
 }
 return {count:entries.length,head:previous};
}
export async function append073(storage,state){
 const entries=JSON.parse(storage.getItem(CHAIN_KEY073)||"[]");
 const checked=await verify073(entries),snapshot=JSON.stringify(checkpoint070(state.rotor,state.centers,state.bridges));
 const entry={ordinal:entries.length+1,previous:checked.head,snapshot,hash:await hash073(checked.head+"|"+snapshot)};
 storage.setItem(CHAIN_KEY073,JSON.stringify([...entries,entry]));
 return entry;
}

export const TX_KEY074="stochieon.gwell074.anchored.v1";
export async function transition074(storage,current,operation){
 const existing=storage.getItem(TX_KEY074);
 const record=existing?JSON.parse(existing):{schema:74,chain:[],state:checkpoint070(current.rotor,current.centers,current.bridges)};
 const checked=await verify073(record.chain);
 const baseline=checkpoint070(record.state.rotor,record.state.centers,record.state.bridges);
 const next=operation(baseline);
 const state=checkpoint070(next.rotor,next.centers,next.bridges);
 const snapshot=JSON.stringify(state);
 const entry={ordinal:checked.count+1,previous:checked.head,snapshot,hash:await hash073(checked.head+"|"+snapshot)};
 const updated={schema:74,state,chain:[...record.chain,entry]};
 storage.setItem(TX_KEY074,JSON.stringify(updated));
 return updated;
}
export async function recover074(storage){
 const raw=storage.getItem(TX_KEY074);
 if(!raw)return null;
 const record=JSON.parse(raw);if(record.schema!==74)throw Error("Invalid anchored state");
 await verify073(record.chain);
 const state=checkpoint070(record.state.rotor,record.state.centers,record.state.bridges);
 if(record.chain.length&&record.chain.at(-1).snapshot!==JSON.stringify(state))throw Error("Anchored head mismatch");
 return state;
}

let serial075=Promise.resolve();
export function serialized075(storage,current,operation){
 const job=serial075.then(()=>transition074(storage,current,operation));
 serial075=job.then(()=>undefined,()=>undefined);
 return job;
}
export async function verifyContinuity075(storage){
 const record=JSON.parse(storage.getItem(TX_KEY074)||"null");
 if(!record)return {count:0,head:"GENESIS"};
 const proof=await verify073(record.chain);
 if(record.chain.length&&record.chain.at(-1).snapshot!==JSON.stringify(checkpoint070(record.state.rotor,record.state.centers,record.state.bridges)))throw Error("Head does not match state");
 return proof;
}

export async function crossTab076(storage,current,operation,locks=globalThis.navigator?.locks){
 if(!locks?.request)throw Error("Web Locks API unavailable; cross-tab write blocked");
 return locks.request("stochieon-gwell-anchored-state",{mode:"exclusive"},async()=>{
  return serialized075(storage,current,operation);
 });
}

export function proposal077(device,baseHead,action){
 if(!device||typeof device!=="string"||!["rotor-step","observe","enqueue","release"].includes(action.type))throw Error("Invalid proposal");
 return {schema:77,device,baseHead,action};
}
export async function accept077(storage,proposal){
 if(proposal.schema!==77)throw Error("Invalid proposal schema");
 const current=JSON.parse(storage.getItem(TX_KEY074)||"null");
 const head=current?(await verify073(current.chain)).head:"GENESIS";
 if(proposal.baseHead!==head)return {status:"STALE",head};
 return {status:"READY_FOR_AUTHORITY",head,proposal};
}

export async function authority078(storage,proposal,authorized=false){
 if(!authorized)return {status:"UNAUTHORIZED"};
 const preflight=await accept077(storage,proposal);
 if(preflight.status!=="READY_FOR_AUTHORITY")return preflight;
 const current=JSON.parse(storage.getItem(TX_KEY074)||"null");
 if(!current)return {status:"NO_GENESIS"};
 const a=proposal.action;
 if(a.type!=="rotor-step")return {status:"UNSUPPORTED_ACTION"};
 const next=await transition074(storage,current.state,p=>({...p,rotor:step(p.rotor)}));
 return {status:"COMMITTED",head:next.chain.at(-1).hash,tick:next.state.rotor.tick};
}

export async function cortexMonitor079(storage){
 const record=JSON.parse(storage.getItem(TX_KEY074)||"null");
 if(!record)return {status:"UNINITIALIZED",core:"{{i}}",head:"GENESIS"};
 const verified=await verifyContinuity075(storage);
 const state=checkpoint070(record.state.rotor,record.state.centers,record.state.bridges);
 const reports=Object.fromEntries(CENTERS065.map(id=>[id,state.centers[id].length]));
 const queued=Object.fromEntries(DOMAINS066.map(id=>[id,state.bridges.queues[id].length]));
 const delivered=Object.fromEntries(DOMAINS066.map(id=>[id,state.bridges.delivered[id].length]));
 return {status:"VERIFIED_LOCAL",core:"{{i}}",tick:state.rotor.tick,head:verified.head,chain:verified.count,reports,queued,delivered};
}

export function health080(current,prior=null,limits={queue:6}){
 const flags=[];
 if(current.status!=="VERIFIED_LOCAL")return {status:"UNKNOWN",flags:["No verified local checkpoint"]};
 if(prior&&current.tick===prior.tick&&current.chain===prior.chain)flags.push("NO_PROGRESS_OBSERVED");
 for(const [id,n] of Object.entries(current.queued))if(n>limits.queue)flags.push("QUEUE_HIGH:"+id);
 if(prior)for(const id of CENTERS065)if(current.reports[id]===prior.reports?.[id])flags.push("NO_NEW_REPORT:"+id);
 return {status:flags.length?"ATTENTION":"OBSERVED",flags,tick:current.tick,head:current.head};
}

export function cadence081(rotor,bridges){
 validate(rotor);validate069(bridges);
 const groups={WAITING:[],DUE:[],OVERDUE:[]};
 for(const domain of DOMAINS066)for(const p of bridges.queues[domain]){
  const delta=rotor.tick-p.due;
  const status=delta<0?"WAITING":delta===0?"DUE":"OVERDUE";
  groups[status].push({id:p.id,domain,due:p.due,tick:rotor.tick,delta,origin:p.origin});
 }
 return {core:"{{i}}",tick:rotor.tick,groups,counts:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,v.length]))};
}

export function releaseEligible082(bridges,tick){
 validate069(bridges);
 if(!Number.isSafeInteger(tick)||tick<0)throw Error("Invalid rotor tick");
 let state=JSON.parse(JSON.stringify(bridges));
 const released=[];
 for(const domain of DOMAINS066){
  const pending=state.queues[domain],held=[];
  for(const packet of pending){
   if(packet.due<=tick){state.delivered[domain].push(packet);released.push({id:packet.id,domain,origin:packet.origin,due:packet.due})}
   else held.push(packet);
  }
  state.queues[domain]=held;
 }
 validate069(state);
 return {state,released};
}

export function advanceAndRelease083(current){
 const rotor=step(current.rotor);
 const move=releaseEligible082(current.bridges,rotor.tick);
 return {rotor,centers:current.centers,bridges:move.state,released:move.released};
}

export function provenance084(bridges){
 validate069(bridges);
 const entries=[];
 for(const domain of DOMAINS066)for(const packet of bridges.delivered[domain]){
  entries.push({id:packet.id,origin:packet.origin,from:packet.from,to:packet.to,bridge:packet.from==="L"||packet.to==="L"?"left":"right",due:packet.due,createdTick:packet.payload?.tick??null,releaseTick:packet.releaseTick??null,core:packet.core});
 }
 return entries.sort((a,b)=>a.id-b.id);
}
export function releaseWithProvenance084(bridges,tick){
 const result=releaseEligible082(bridges,tick);
 for(const domain of DOMAINS066)for(const packet of result.state.delivered[domain]){
  if(packet.releaseTick===undefined&&result.released.some(e=>e.id===packet.id))packet.releaseTick=tick;
 }
 return result;
}
export function advanceAndRelease084(current){
 const rotor=step(current.rotor);
 const move=releaseWithProvenance084(current.bridges,rotor.tick);
 return {rotor,centers:current.centers,bridges:move.state,released:move.released};
}

export const MEMORY_KEY085="stochieon.gwell085.memory.v1";
export function memory085(){return {schema:85,core:"{{i}}",records:[]}}
export function remember085(store,center,content,tick){
 if(!CENTERS065.includes(center)||!Number.isSafeInteger(tick)||tick<0||typeof content!=="string"||!content.trim())throw Error("Invalid memory input");
 const next=JSON.parse(JSON.stringify(store));
 next.records.push({id:next.records.length+1,center,createdTick:tick,content,accesses:[]});
 return next;
}
export function recall085(store,id,tick){
 const next=JSON.parse(JSON.stringify(store));
 const item=next.records.find(x=>x.id===id);
 if(!item||!Number.isSafeInteger(tick)||tick<item.createdTick)throw Error("Memory unavailable");
 item.accesses.push({tick,ordinal:item.accesses.length+1});
 return {store:next,memory:{id:item.id,center:item.center,createdTick:item.createdTick,content:item.content}};
}
export function verifyMemory085(store){
 if(store?.schema!==85||store.core!=="{{i}}"||!Array.isArray(store.records))throw Error("Invalid memory store");
 store.records.forEach((r,i)=>{if(r.id!==i+1||!CENTERS065.includes(r.center)||typeof r.content!=="string"||!Array.isArray(r.accesses))throw Error("Invalid memory record")});
 return true;
}

export const DOMAINS086=Object.freeze(["LH","CH","RH"]);
export const LAYERS086=Object.freeze([
 {level:0,token:"{{i}}",shadow:0,modes:["active","absorbing","observing"]},
 {level:1,token:"{{id}}",shadow:1,modes:["active","absorbing","osmosis"]},
 {level:2,token:"{{sid}}",shadow:2,modes:["active","absorbing","osmosis","holography"]}
]);
export function lattice086(){
 return {schema:86,domains:Object.fromEntries(DOMAINS086.map(domain=>[domain,LAYERS086.map(layer=>({
  level:layer.level,token:layer.token,shadow:layer.shadow,modes:[...layer.modes],records:[],reports:[]
 }))]))};
}
export function absorb086(lattice,domain,level,memoryId,tick){
 if(!DOMAINS086.includes(domain)||![0,1,2].includes(level))throw Error("Unknown layer");
 if(!Number.isSafeInteger(memoryId)||memoryId<1||!Number.isSafeInteger(tick)||tick<0)throw Error("Invalid memory address");
 const next=JSON.parse(JSON.stringify(lattice));
 const cell=next.domains[domain][level];
 cell.records.push({memoryId,tick,ordinal:cell.records.length+1});
 return next;
}
export function observeLayer086(lattice,domain,level){
 if(!DOMAINS086.includes(domain)||![0,1,2].includes(level))throw Error("Unknown layer");
 const cell=lattice.domains[domain][level];
 return {domain,level,token:cell.token,shadow:cell.shadow,modes:[...cell.modes],count:cell.records.length};
}

export function inherit087(mesh,domain,fromLevel,tick){
 if(!DOMAINS086.includes(domain)||![0,1].includes(fromLevel)||!Number.isSafeInteger(tick)||tick<0)throw Error("Invalid inheritance address");
 const next=JSON.parse(JSON.stringify(mesh)),parent=next.domains[domain][fromLevel],child=next.domains[domain][fromLevel+1];
 const existing=new Set(child.records.filter(r=>r.parentLevel===fromLevel).map(r=>r.parentOrdinal));
 let added=0;
 for(const record of parent.records){
  if(existing.has(record.ordinal))continue;
  child.records.push({memoryId:record.memoryId,tick,ordinal:child.records.length+1,parentLevel:fromLevel,parentOrdinal:record.ordinal,originDomain:domain,originTick:record.originTick??record.tick,kind:"shadow"});
  added++;
 }
 return {mesh:next,added};
}
export function lineage087(mesh,domain,level){
 if(!DOMAINS086.includes(domain)||![0,1,2].includes(level))throw Error("Invalid layer");
 return mesh.domains[domain][level].records.map(r=>({memoryId:r.memoryId,ordinal:r.ordinal,parentLevel:r.parentLevel??null,parentOrdinal:r.parentOrdinal??null,originTick:r.originTick??r.tick,kind:r.kind??"direct"}));
}

export const TIERS088=Object.freeze([
 {level:0,term:"short",strength:"weak",token:"{{i}}"},
 {level:1,term:"medium",strength:"medium",token:"{{id}}"},
 {level:2,term:"long",strength:"strong",token:"{{sid}}"}
]);
export function verifyLineage088(mesh){
 const results=[];
 for(const domain of DOMAINS086){
  const cells=mesh.domains?.[domain];
  if(!Array.isArray(cells)||cells.length!==3)throw Error("Missing compartment "+domain);
  for(let level=0;level<3;level++){
   const list=cells[level].records;
   for(let i=0;i<list.length;i++){
    const record=list[i];if(record.ordinal!==i+1)throw Error("Ordinal mismatch "+domain);
    if(level>0&&record.kind==="shadow"){
     const parent=cells[level-1].records[record.parentOrdinal-1];
     if(!parent||record.parentLevel!==level-1||record.originDomain!==domain||parent.memoryId!==record.memoryId)throw Error("Broken lineage "+domain+" L"+level);
     if(level===2&&parent.kind==="shadow"){
      const origin=cells[0].records[parent.parentOrdinal-1];
      if(!origin||origin.memoryId!==record.memoryId)throw Error("Broken root "+domain);
     }
    }
   }
   results.push({domain,level,term:TIERS088[level].term,strength:TIERS088[level].strength,count:list.length});
  }
 }
 return {valid:true,tiers:results};
}
