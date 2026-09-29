# 11 — Optional: a quiet garden soundscape

Status: optional, not started. Dependencies: 03. Coordinate with iOS ticket 08 (audio and haptics).

## Outcome

With sound on, the garden sounds like a garden: the fountain, a breeze, birds by day, crickets on summer evenings, a hush in winter. The run keeps its kalimba notes over a quieter version of the same ambience.

## Current behaviour

Sound is off by default. There is no music or ambient sound; only synthesised notes for hits, pickups and celebrations, and a synthesised purr.

## Design

- A few short, seamless ambient loops layered by season and time of day: fountain trickle (always, soft), breeze, daytime birds (spring and summer), evening crickets (summer), a still winter air tone. Visitor calls are short and occasional (the blue jay's call when it's present).
- Low volume, slow crossfades, never louder than the play notes.
- Stays off by default until the owner decides otherwise (iOS ticket 08 settles defaults and the silent switch).
- Audio must be bundled and licensed for distribution (iOS ticket 12). Either record them (owner) or use clearly licensed recordings; synthesised birdsong tends to sound artificial.

## Required from the owner

Whether to do this for 1.0, and a source for the recordings.
