# Canonical GWELL Boundaries — 001–021

Status: initial publication / append-only semantic numbering.

```text
LATTICE
  CUBIT
    TENSOR
      SAPPHON
        O3 { O2 { O1 { - U + } } }
```

The notation `{{ outer /inner\ outer }}` describes facing edges. Three outer nested shells protect one inner well: **3:1**.

001 FORM — `-U+` is a single well with opposing oriented interfaces.
002 CONTINUITY — shell topology and independent identity survive edge encounters.
003 RECIPROCITY — any modeled transferred quantity is debited and credited.
004 IMPEDANCE — each shell has a separately parameterized transfer function.
005 ACCOUNTING — transmitted, reflected and retained quantities exhaust admitted input.
006 CYCLE — retention may release, return or circulate; total accounting is closed.
007 PHASE — phase difference is invariant under common phase shift.
008 DETUNING — in the specified sinusoidal two-oscillator model, fixed-phase states require `|Δω| ≤ K`.
009 COHERENCE — network order is observed by a complex phase mean, not imposed consensus.
010 WINDING — closed contours of a defined phase field have integer winding.
011 DEFECT — charge is transported and opposites may cancel under permitted dynamics.
012 PINNING — defects may encounter a potential barrier and release when driven.
013 HYSTERESIS — one well stores a binary history-dependent state.
014 PROPAGATION — state influence is not equivalent to transporting a unique identity.
015 HORIZON — influence is bounded by path hops per synchronized tick.
016 CONVERGENCE — independent observations feed one local deterministic update; no quorum.
017 CAUSAL ORDER — event, arrival and observation times are separately recorded.
018 REPLAY — canonical event ordering and frozen rules reproduce a state.
019 DIVERGENCE — report first disagreement, WHAT, HOW and established WHY or UNKNOWN.
020 ISOLATION — disputed event and its dependents are quarantined; unaffected paths continue.
021 RECOVERY — append a referenced recovery decision; original dispute remains visible.

## Operational GWELL 020–021

```text
receive(event)
    |
    +-- admissible and dependencies committed --> apply once --> append commit
    |
    +-- conflicting observations --> append dispute --> quarantine event
    |                                                    |
    |                                      quarantine dependencies
    |                                                    |
    +-- new referenced recovery evidence --> append resolution record
                                                  |
                                    replay eligible order from source
                                                  |
                                    append new resulting commit
```

The exact mechanism for validating a resolution is a *governed local rule*, not a vote. Provenance is recorded even when cause remains unknown. No automatic promotion of later matching observations.

## Model restrictions

These are normative modeling rules, not natural laws proven for real sapphons. Mathematical examples (phase locking, winding, pinning) apply only under their explicit assumptions.


## GWELL 022 — Inward-only rotating U, lower C throat, cobalt identity

Design amendment (2026-10-28): The canonical 3:1 outer-shell nesting is retained. The top negative-facing port is **sealed** (no admission). A single lower C-shaped throat is the permitted intake and inference interface. The U well spins, with inward-only packet trajectories in the illustrative page. Its center is a cobalt-colored identity anchor `{{i}}` that survives every allowed update.

```text
            - SEALED -
             O3 / O2 / O1
                 U ↻
             COBALT {{i}}
                ↑
             C INTAKE
```

**Invariant 022**: `outer depth = 3`, `inner count = 1`, `identity = {{i}}`; admission through C only; `- ` upper boundary blocked; each visual pulse moves inward, not outward. The retained identity is an address/label and not a claim of physical gravitational mass or established sapphon particles. The earlier `-U+` token remains provenance; `YOUYOU / C-U` is the instantiated directed-well mode.

## GWELL 023 — Causal inference boundary: observation is not explanation

At the lower C intake, incoming events are observations, not automatically causes. The sealed upper negative port remains closed. O3 records the observation with source and receipt order, O2 distinguishes candidate explanations from what is actually observed, and O1 admits only an explicitly supported conclusion to U. Cobalt `{{i}}` stays unchanged.

```text
           TOP − SEALED
            O3 : RECORD
            O2 : COMPARE
            O1 : INFER / HOLD
             U ↻ : CONTAIN
         COBALT {{i}} : FIXED
                   ↑
            C : OBSERVE
```

**Invariant 023**: `observation ≠ inference ≠ verified cause`. An observation without adequate distinguishing evidence remains `UNKNOWN`; multiple compatible causes remain candidates. No inference may erase its observation record, cross the sealed port, or replace `{{i}}`.

Reference rule: an observation must include `id`, `source`, `value` and `arrival`. Inference results must include `status: observed | hypothesis | supported | unknown`, plus references to supporting observation IDs. In this demonstration, a single observation is insufficient to declare a cause.

This is a computational epistemic boundary, not physical proof of a gravitational or subatomic phenomenon.
