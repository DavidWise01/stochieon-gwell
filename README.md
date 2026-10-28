# STOCHIEON — GWELL

Canonical dedicated repository for the sapphon / GWELL architecture developed in the October 27–28, 2026 design thread.

## Canon

```text
LATTICE → CUBIT → TENSOR → SAPPHON → GWELL
GWELL = {{ outer³ / inner¹ \ outer³ }} = -U+
O3 { O2 { O1 { U } } }
```

Three nested outer shells, one inner well, two facing edges. Adjoining gwells interact at `+ | -` without merging their independent U states.

The numbered specification and original design progression are in [canon/BOUNDARIES.md](canon/BOUNDARIES.md), covering 001–021.

## Contents

- [Interactive GWELL page](index.html) — standalone visualization and isolation / recovery demonstrator.
- [GWELL reference engine](src/gwell.mjs) — deterministic memory, shell accounting, causal horizons, immutable observation, dispute quarantine and recovery provenance.
- [Tests](tests/gwell.test.mjs) — runnable with `node --test tests/gwell.test.mjs`.
- [Canonical boundary registry](canon/BOUNDARIES.md) — sequential definitions, append-only boundary numbering.

## Rules

1. Three outer shells O3/O2/O1 and one inner U remain distinct.
2. A and B observations retain their source identities; no voting or quorum.
3. All accepted state changes are deterministic local transitions.
4. Conflicting observations are recorded and their dependent events quarantined.
5. Recovery requires a new referenced evidence record. Never rewrite the original dispute.
6. Preserve established mathematical assumptions explicitly; this is a proposed computational model, not verified new particle physics.

## Authorship

Conceptual direction: David Lee Wise / STOCHIEON framework. This repository is a dated implementation and documentation artifact.