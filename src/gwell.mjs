// STOCHIEON GWELL reference engine — deterministic, observation-only.
export const GEOMETRY = Object.freeze({token:"-U+",shells:3,inner:1,outer:["O3","O2","O1"]});
export const RULE_VERSION = "GWELL-021.1";

export function hysteresis(prior, drive, off=0.3, on=0.7) {
  if (off >= on) throw new Error("off must be below on");
  if (![0,1].includes(prior) || !Number.isFinite(drive)) throw new Error("invalid state/drive");
  return drive >= on ? 1 : drive <= off ? 0 : prior;
}

export function replay(initial, events, {off=0.3,on=0.7}={}) {
  const states=[initial];
  for (const event of events) states.push(hysteresis(states.at(-1),event.drive,off,on));
  return {state:states.at(-1),states};
}

export function firstDifference(a,b) {
  const length=Math.max(a.length,b.length);
  for(let i=0;i<length;i++) if(a[i]!==b[i]) return {cycle:i,a:a[i]??null,b:b[i]??null};
  return null;
}

export function shellAccounting(input, params) {
  let current=input, reflected=0, retained=0;
  for(const {tau,rho} of params) {
    if(tau<0||rho<0||tau+rho>1+1e-12) throw new Error("invalid shell fractions");
    reflected+=current*rho;
    retained+=current*(1-tau-rho);
    current*=tau;
  }
  return {inner:current,reflected,retained,total:current+reflected+retained};
}

export function causalHorizon(from,to,cycles) {
  return Math.abs(from[0]-to[0])+Math.abs(from[1]-to[1])<=cycles;
}

export function newLedger(initial=0) {
  if (![0,1].includes(initial)) throw new Error("invalid initial state");
  return {initial,state:initial,history:[],quarantine:new Set(),committed:new Set(),sequence:0};
}

export function record(ledger,event) {
  if(!event?.id || !Number.isFinite(event.drive)) throw new Error("invalid event");
  if(ledger.history.some(x=>x.id===event.id)) throw new Error("duplicate event id");
  const dependencies=event.dependsOn??[];
  const blocked=dependencies.some(id=>!ledger.committed.has(id));
  const disputed=Boolean(event.disputed);
  const status=blocked||disputed?"quarantined":"committed";
  const before=ledger.state;
  if(status==="committed") {
    ledger.state=hysteresis(ledger.state,event.drive);
    ledger.committed.add(event.id);
  } else ledger.quarantine.add(event.id);
  const entry=Object.freeze({
    sequence:++ledger.sequence,id:event.id,drive:event.drive,
    dependsOn:Object.freeze([...dependencies]),disputed,
    status,before,after:ledger.state,rule:RULE_VERSION
  });
  ledger.history.push(entry);
  return entry;
}

export function recovery(ledger,{id,disputeId,evidence,decision}) {
  if(!id || !ledger.quarantine.has(disputeId) || !evidence || !["admit","reject"].includes(decision))
    throw new Error("resolution requires quarantined dispute, evidence, and decision");
  if(ledger.history.some(x=>x.id===id)) throw new Error("duplicate resolution id");
  const entry=Object.freeze({
    sequence:++ledger.sequence,id,type:"recovery",disputeId,
    evidence,decision,status:"recorded",state:ledger.state,rule:RULE_VERSION
  });
  ledger.history.push(entry);
  // Explicit record only: no silent alteration or retroactive promotion.
  return entry;
}
