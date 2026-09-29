# 03 — Follow the real northern seasons

Status: planned. Dependencies: 01. Art: seasonal backdrops (08) and seasonal clumps (09) for the final look; the code works with existing art first.

## Outcome

The garden follows the calendar. In late September it turns autumnal alongside the real garden it's drawn from. Winter is quiet, frosty and sometimes snowy; spring brings bulbs; summer is at its fullest. Coming back after a few weeks, she notices the season changed.

## Design

**Seasons** (northern hemisphere, owner decision):

| Season | Months | Light | In the air | Garden |
|---|---|---|---|---|
| Spring | March–May | Fresh, slightly cool | Drifting blossom petals | Bulbs and forget-me-nots; bluebells in April–May |
| Summer | June–August | Warm, golden | Pollen glints | Everything flowers |
| Autumn | September–November | Warm amber, lower | Falling leaves | Late flowers (cosmos, asters); seedheads; leaves on the lawn |
| Winter | December–February | Pale, cool | Occasional snow | Flowering plants rest; frost on the lawn; snowdrops and hellebores late in winter |

Season edges blend over about a week, so the change is gradual.

**What flowers when.** Each flowering kind has a flowering window by month. Outside it, a plant shows as leaves (the existing `clump-leafy`). In winter most flowering plants rest out of sight, reusing the dormancy drawing retired from absence rest (ticket 01); grass, fern and clover stay with a frost tint. Beds flower from March to November and rest in winter, showing their young stage with frost. A bed's growth and stage are never changed by the season, only its appearance.

**The run.** The run's backdrop takes the real season's light and air. The turn-based "seasons" every 25 turns become **times of day** (morning, afternoon, golden evening, starlight, then a new morning), keeping the variety the play feedback asked for without pretending a year passes in one run.

**The home screen** uses the real time of day as well: evening light after 18:00, starlight after 21:00, with fireflies on summer nights.

## Build requirements

1. `garden-time.js`: `season(date)` returning the season and a blend toward the next, northern hemisphere, local time; flowering windows per kind.
2. Garden view and run: season light grading (multiply and overlay, as the run already does), season air particles including snow, frost wash in winter.
3. Plants out of their window draw as leafy clumps; winter dormancy for flowering kinds; beds rest in winter.
4. Run: replace turn-based seasons with times of day; keep the small introduction card for each change.
5. A development override (`?season=winter`, `?month=1`) for review screenshots only.
6. Seasonal backdrops (08) and clumps (09) slot in when present in the manifest; everything works without them.

## Acceptance criteria

- Screenshots for each season at 390 × 844 read as that season without text.
- Setting the device clock across a season boundary changes the look gradually over about a week.
- No plant, bed or growth value changes because of the season.
- Reduced motion: no snow or leaf motion, still frames only.
