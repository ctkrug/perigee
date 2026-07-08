---
title: "Perigee: a daily puzzle where real n-body gravity flies the shot"
published: false
tags: javascript, gamedev, canvas, webdev
---

I wanted a daily puzzle that scratched a different itch than the word games. Not vocabulary,
but the specific satisfaction of reading a gravity well correctly and watching one committed
shot play out. So I built [Perigee](https://apps.charliekrug.com/perigee/): you aim once, let
go, and a real n-body gravity simulation flies your probe around planets toward a target. No
thrust, no steering, no second input. The whole game is the read.

Two build decisions did most of the work of making it feel honest.

## The preview runs the same physics as the real shot

Most "physics" puzzle games fake it: the arc you see is authored, not computed. I wanted the
opposite guarantee, that the dashed aiming preview can never show you a shot the real flight
won't match. The cheapest way to guarantee that is to not have two systems at all.

The physics core is one pure function that advances a probe by one step against every planet:

```js
export function step(probe, planets, dt, G = DEFAULT_G) {
  const a0 = acceleration(probe.position, planets, G);
  const nextPosition = add(add(probe.position, scale(probe.velocity, dt)), scale(a0, 0.5 * dt * dt));
  const a1 = acceleration(nextPosition, planets, G);
  const nextVelocity = add(probe.velocity, scale(add(a0, a1), 0.5 * dt));
  return { position: nextPosition, velocity: nextVelocity, radius: probe.radius };
}
```

The live flight calls `step()` each frame. The ghost path calls the same `step()` in a loop
without mutating game state, stopping where the shot would actually stop (a planet collision or
the level bounds). Preview and reality are the same code path, so they cannot drift.

## Verlet integration, a softened well, and substepping

The obvious choice, plain Euler integration, visibly leaks energy over a multi-second flight.
A slingshot that should come back around instead spirals out, and the puzzle stops reading as
fair. Velocity-Verlet (above) is symmetric and energy-stable, which is what lets a tight flyby
look sharp without blowing up.

Two more details mattered for close passes. A true `1/r^2` force spikes to infinity as the
probe approaches a planet center, so I add a small softening term to `distSq`, which keeps a
near-miss dramatic but finite. And I run six integration substeps per animation frame, because a
single large step can tunnel straight through a planet's gravity well before any collision check
ever fires.

## Daily without a backend

"Daily" is enforced entirely on the client. A level id is derived from the calendar date
(whole days since a fixed start, modulo the level count), so the same date always resolves to
the same puzzle for everyone, and any unparsable or pre-launch date falls back to level one.
That keeps the whole thing a static bundle: no server, free to host, deployable to a subpath.

## What I would do differently

The pure core (vectors, integrator, trajectory, outcome rule, level lookup) is at 100% test
coverage and was a joy to work with. The browser wiring was where bugs hid. My first version was
literally unplayable without a mouse, and I only caught it by driving the built page in a real
headless browser. Next time that browser pass happens on day one, not near the end. I would also
author levels with a small solver in the loop instead of by hand and eye.

Play today's level: [apps.charliekrug.com/perigee](https://apps.charliekrug.com/perigee/)
Source: [github.com/ctkrug/perigee](https://github.com/ctkrug/perigee)
