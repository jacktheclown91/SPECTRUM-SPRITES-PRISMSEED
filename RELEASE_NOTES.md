# PRISMSEED 1.0.0

First public release candidate.

The release pass focused on making the game understandable without sanding off the weird parts: clickable upgrade cards, clearer interaction language, explicit death/reset behavior, combat feedback, shared boss HP, deterministic elites and stronger Prism Loop escalation.

The final jam cartridge is one self-contained `index.html` at **12,626 bytes** after Zopfli compression.

### Current run rules

- Death shatters the current build back to LV1.
- World history, mutations, Wells/loops and other canonical events survive death.
- Reloading keeps the active run/build.
- `NEW` intentionally erases the current seed's local world state.

### Online

Same seed = same relay room. The world is generated locally; compact presence, damage and canonical events are exchanged over the official js13k relay.
