# Perigee — Design Direction

The art-direction brief. Every BUILD and QA run follows this file; the landing page (`site/`)
and the app (`index.html`) share **one** direction and one set of tokens — product and page are
one brand. Change it only deliberately, in its own commit, and say why.

## 1. Aesthetic direction

**Perigee is a 1980s orbital tracking console.** The screen is a near-black amber-phosphor CRT:
scanlines, a soft glow bleeding off every line and glyph, a radar-sweep grid under the action.
Planets read as warm plasma wells rendered in amber-to-burnt-orange gradients; the probe is a
single bright phosphor dot; the target is a cool green lock-on ring — the one deliberate color
break in an otherwise monochrome-amber palette, so "goal" always reads instantly against
"planet." This is a mission-control instrument tracking a real object through real gravity, not
a cartoon space scene.

This is chosen deliberately against the recent portfolio's directions: blueprint cyan-on-navy
(Monotile, Bankroll), paper-and-ink cream (Codon, CVE Radar), night-sky ink-blue/brass (Gistmap),
darkfield green/magenta/cyan fluorescence (Mitosis Lab), and violet-black UV (Unmask). Amber CRT
phosphor is a family none of those occupy, while still fitting the "instrument, not toy" register
a physics-tracking game calls for — and it gives the orbital-mechanics subject matter a genuinely
period-appropriate home (this is what a 1980s NORAD tracking screen looked like).

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a0806` | Page background |
| `--surface-1` | `#14100a` | Panels, canvas frame |
| `--surface-2` | `#1f180f` | Panel borders, hover surfaces |
| `--text` | `#ffd9a0` | Primary text, wordmark |
| `--text-muted` | `#a8845a` | Secondary text, labels |
| `--accent` | `#ffb000` | Amber phosphor — primary accent, planets, probe |
| `--accent-support` | `#ff6b35` | Burnt-orange — planet gradient edge, impact flash |
| `--success` | `#7fff9f` | Goal ring, win state — the one cool color break |
| `--danger` | `#ff4444` | Crash / collision feedback |

**Type pairing:** display font **Press Start 2P** (Google Fonts, pixel-arcade) for the wordmark
and level headers; UI font **Share Tech Mono** (Google Fonts, CRT terminal monospace) for body
text, HUD numbers, and buttons. Both fall back to `"Courier New", monospace`. Every measurement
stays monospace-terminal in feel — this is a console, not a poster.

**Spacing scale:** 4/8px — `4, 8, 16, 24, 32`. **Corner radius:** 2px small controls, 4px panels
— sharp, not soft; CRT hardware doesn't have rounded bezels. **Shadow/glow:** amber
`text-shadow`/`box-shadow` glow (`0 0 6px` small, `0 0 16px` panel-level) instead of drop
shadows — everything on this screen emits light, nothing casts shade. **Motion:** UI transitions
150–200ms ease-out; game feedback (impact, launch, goal-pop) 80–140ms ease-out.

## 3. Layout intent

The hero is the tracking display itself — the canvas — which takes the majority of the viewport
(~70% width on desktop) with a slim HUD panel (shots, par, status, mute) beside it, styled as a
secondary readout panel, not a competing block. At 1440×900: canvas left/center filling ~70% of
width and ~80% of height, HUD panel a fixed 260px column to its right. At 390×844: canvas stacks
on top and fills ~60vh, HUD panel below it as a full-width readout strip — never squeezed into a
sidebar at phone width.

## 4. Signature detail

A **radar-sweep line** rotates slowly across the canvas background (a soft amber wedge, low
opacity, CSS/canvas animated), reinforcing "you are watching a tracking instrument" even before
a shot is in flight. Combined with the scanline texture and the glow-emitting planets, this is
the one flourish that makes the console feel alive at rest, not just during a shot.

## 5. The juice plan

- **Movement:** the probe's flight is the real simulation output — no tween needed on the flight
  path itself — but the ghost/prediction path animates in with a quick 120ms fade as the player
  starts dragging, and the probe dot gets a subtle motion-trail (short fading arc) while flying.
- **Impact feedback:** on collision, a burnt-orange flash on the planet, a 4px/80ms canvas shake,
  and a burst of a few ember particles at the impact point.
- **Goal feedback:** the green lock-on ring pulses outward once and briefly fills solid green the
  instant the probe clips it, before the win overlay appears.
- **Win celebration:** a mission-complete overlay — shot count vs. par, a compact trajectory
  recap line, a shower of amber/green "spark" particles reading like static discharge — and one
  clear CTA: "Share Result."
- **Synth SFX list** (WebAudio oscillators only, mute persisted to `localStorage`):
  - *Aim drag:* a soft low sine "tension hum," pitch rising with drag distance.
  - *Launch:* a quick sawtooth burst with a fast downward pitch sweep.
  - *Gravity-assist flyby:* a rising sine sweep as the probe passes close to a planet.
  - *Collision:* a short, harsh square-wave buzz.
  - *Goal / win:* an ascending triangle-wave three-note chime.
  - *UI click:* a short high square-wave blip.
  All levels kept subtle and rate-throttled; a mute toggle in the top bar persists across visits.
