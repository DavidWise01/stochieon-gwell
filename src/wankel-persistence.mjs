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
