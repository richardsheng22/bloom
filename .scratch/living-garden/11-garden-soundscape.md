# 11 — Optional: a quiet garden soundscape

Status: synthesised version implemented (2026-09-29); bird calls wait on recordings. Dependencies: 03. Coordinate with iOS ticket 08 (audio and haptics).

## Outcome

With sound on, the garden sounds like a garden: the fountain, a breeze, birds by day, crickets on summer evenings, a hush in winter. The run keeps its kalimba notes over a quieter version of the same ambience.

## Current behaviour

Sound is off by default. There is no music or ambient sound; only synthesised notes for hits, pickups and celebrations, and a synthesised purr.

## Design

- A few short, seamless ambient loops layered by season and time of day: fountain trickle (always, soft), breeze, daytime birds (spring and summer), evening crickets (summer), a still winter air tone. Visitor calls are short and occasional (the blue jay's call when it's present).
- Low volume, slow crossfades, never louder than the play notes.
- Stays off by default until the owner decides otherwise (iOS ticket 08 settles defaults and the silent switch).
- Audio must be bundled and licensed for distribution (iOS ticket 12). Either record them (owner) or use clearly licensed recordings; synthesised birdsong tends to sound artificial.

## What it takes (2026-09-29)

External recordings are not required for a first version. The game already makes all its sounds in code (Web Audio), and some garden sounds synthesise convincingly:

| Sound | Synthesised? |
|---|---|
| Fountain trickle | Yes: filtered noise with a slow, bubbling modulation |
| Breeze through leaves | Yes: band-passed noise swelling and fading |
| Summer crickets at night | Yes: short high chirp trains |
| Winter hush, a distant wind | Yes |
| Birdsong, a blue jay's call, a cardinal's whistle | Poorly: synthesised birds sound like toys. These are the ones worth recordings. |

So there are two ways:
1. **Synthesised only, no assets:** fountain, breeze, crickets and winter air by season and time of day. Small and license-free; a day or two of work plus tuning by ear.
2. **Synthesised base plus a few short recordings** for the birds and visitors (blue jay, cardinal, a general daytime chorus). These need to be licensed for an App Store app: CC0 or bought (for example from Freesound's CC0 filter or a sound library), or recorded in the owner's own garden on a phone, which would make it truly theirs. About 5–8 clips of a few seconds each, a few hundred KB in total.

Either way it stays off by default, respects the silent switch (iOS ticket 08), and never plays louder than the game's notes.

## Required from the owner

Whether to do this for 1.0, and a source for the recordings.

## Implementation record — 2026-09-29 (owner chose the synthesised version)

- `garden-sound.js` (`BloomSound.mix`, with `tests/garden-sound.test.cjs`) decides the levels: a fountain trickle with droplets (silent in winter, when the painted fountain is iced), a breeze that swells and eases (gustier in autumn and winter), and crickets on summer evenings and nights (fewer in autumn). A run plays the same garden at 40%, under the notes.
- Synthesis in `index.html` (`makeAmbience`, `updateAmbience`): looped noise through filters for the fountain and breeze, short oscillator voices for droplets and chirps. Nothing is downloaded or bundled.
- It follows the one sound preference, which the garden screen can now set too (a sound button in its top-left corner); it's silenced at once when the game goes to the background.
- Measured in Chromium: steady signal in every season; the crickets' band is about 20 dB above winter's on a summer night; near silence within a moment of switching off. Levels are a first guess and need tuning by ear on a phone (iOS ticket 08 covers the silent switch and interruptions).
- Bird calls for visitors (blue jay, cardinal) are left for recordings, as above.
