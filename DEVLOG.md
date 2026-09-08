# Dev log

A few notes from building PRISMSEED, mostly so I remember which weird decisions were intentional.

## The original bad idea

The useful thought was: **13 KB does not need to contain the world. It only needs to contain the rules that grow the world.**

That turned into a seeded planet, generated creature programs, mutations, dungeons and a tiny event ledger. Then I kept adding things because apparently respecting a byte limit means repeatedly seeing how close I can stand to it without falling over.

## Things that broke along the way

- Enemies once wandered completely off the visible map. They have boundaries now. Freedom was revoked.
- A Prism Cache briefly became an infinite level-up machine. Fun for about thirty seconds, terrible for the game.
- The UI would occasionally tell you to press `E` from farther away than the actual interaction code allowed. Extremely helpful.
- One audio helper managed to call itself forever and explode the stack on the first click. That was a good one.
- Procedural zone transitions could drop the player directly inside a ruin. Every overworld reposition now resolves to a nearby walkable spot.
- Early upgrades changed weapon behavior without explaining why. Progression is now explicit and the level-up choices are actual clickable cards.

## Why multiplayer is a little strange

I did not have the bytes to make the server authoritative over a whole procedural ecology, and I did not really want to anyway.

Players with the same PrismSeed generate the same world locally. The network sends presence, compact damage messages and canonical events. So the clients can disagree a little about where a creature is standing for a moment, but agree about which creature got hit, died, mutated, restored a Well or advanced the world into another Prism Loop.

It is basically syncing causes instead of streaming the universe.

## The last few hundred bytes

Once the game was stable, the packer got mean.

Readable names stay in source, while the release build folds constants, removes data the game never reads, shortens internal properties and rearranges modules for compression. A packed-artifact smoke test exists because aggressive golf without a second verification pass is how you end up submitting 12 KB of beautifully compressed regret.

## 1.0.0

The release build landed at **12,626 bytes**. It has procedural worlds, persistent history, mutations, dungeons, co-op, endless loops, elites, build evolutions and a boss.

There are still bytes left, which is dangerous information to know.
