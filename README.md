# Spectrum Sprites: PRISMSEED — The Living Cartridge

PRISMSEED is my js13k-sized procedural action roguelite experiment: instead of trying to cram a world into 13 KB, I crammed in a machine that keeps making one.

One seed grows the regions, creatures, mutations, dungeons, Prism Wells, upgrade choices, world history and increasingly rude Prism Loops. There is also optional online co-op through the js13k relay; clients rebuild the same world locally and mostly send tiny causes/events instead of shipping world state around.

## Play

- **WASD / Arrow keys** — move
- **Space / Click** — shoot
- **E** — interact
- **1 / 2 / 3 or click a card** — choose an upgrade
- **Tab** — help
- **ONLINE** — connect/disconnect
- **NEW** — erase the current seed's local world and start it again

The loop is simple: kill things, collect Prism XP, make a ridiculous build, restore seven Wells, return to `0,0`, kill the Prism Devourer, and discover that the universe has decided to get worse.

Death resets the current build to LV1. The world remembers what happened. Reloading the page keeps the current run. `NEW` is the deliberate full reset.

## What's in the tiny box

- deterministic 64×64 wrapping world
- generated species and mutation lineages
- generated key/lock/secret/boss dungeons
- nine stackable genes and clickable level-up cards
- six named build evolutions
- loop-aware Prism Wells and endless Prism Loops
- deterministic Prism Elites that inherit nastier traits later
- Prism Devourer boss with shared HP feedback
- optional co-op, Spectrum Resonance and shared combat outcomes
- persistent canonical event history
- tiny procedural sound effects and combat feedback

## Source vs. jam build

The readable source lives in `src/`. `index.html` is the development entry point.

The readable source is what I keep here. The packer turns it into the deliberately ugly one-file jam cartridge.

To sanity-check and rebuild it:

```sh
npm run check
npm run pack
```

No runtime npm packages are required.

The 1.0.0 submission is **12,626 bytes** with the final Zopfli pass, under the 13,312-byte cap.

## A note on the code golf

The packer does some fairly aggressive release-only surgery: internal fields get shortened, dead diagnostic data disappears, event constants get folded, and a few hot paths use smaller representations. The release process also checks the golfed artifact against the readable source because "it compressed smaller" is not a useful feature if the game quietly stops being the same game.

See [DEVLOG.md](DEVLOG.md) for the less formal version of how this got here.
