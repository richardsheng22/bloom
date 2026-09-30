# Erwu likeness and turn correction

Base: develop eaf766b. This continues the user's direction to restore Erwu's likeness and remove flattening during direction changes.

## Confirmed rendering defect and fix

The production renderer used `max(0.12, abs(cos(turnProgress * PI)))` for horizontal scale during a 200 ms reversal. The side and both diagonal views therefore became 12% of normal width at the midpoint. `node --test tests/erwu-turn.test.cjs` reproduced this on all three views before the fix; reduced motion did not squash.

Removed the horizontal squeeze and its shrinking shadow. A reversal now blends from the previously displayed layers to the new facing at unchanged dimensions. Repeated layers are merged to bound interrupted transitions; leaving walking clears the old facing snapshot. Reduced motion switches immediately.

This removes geometric flattening, but a short dissolve can still show both silhouettes. It is an interim transition, not a natural anatomical turn. The next animation pass should use consistent intermediate headings and planted-paw turn poses. Do not call this a finished natural gait.

Validation: 85 unit tests pass, including six new production-render-branch reversal regressions. The browser render suite exercises 15 reversal samples against the real atlas and checks that horizontal canvas scales retain absolute value 1; the shadow's vertical flattening is intentionally allowed. Existing painted-expression, plant-trait, and viewport checks also pass. `turn-volume.png` records the transition at 0/50/100/150/200 ms.

## Likeness direction

Use the real photos for identity, and the user's watercolor sheet for medium. The pale, chunky-textured prior diagonal anchor is superseded as a future art reference.

The first study made the cheeks and jaw too broad. The user's latest close-up corrects that interpretation: slimmer face, less pronounced jowls, a gently tapering muzzle, small dark nose, softly rounded golden-olive eyes, natural ears, and charcoal-grey fur. Avoid a generic exaggerated British Shorthair face. Maintain natural body weight without an oversized neck ruff. Soft connected watercolor washes should replace repeated leaf/scale-shaped fur marks.

`erwu-watercolor-study.png` is the revised four-view likeness study, generated with the built-in image tool. Exact prompts and generation sources are recorded in `prompts.json`. It is an art-direction reference, not an animation sprite sheet; its paper background and stance variations are not production-ready. It has not replaced the live atlas.

## Next animation slice

1. Establish the revised likeness across neutral front, profile, toward-diagonal and away-diagonal views at a shared anatomical scale. User feedback on likeness remains useful before a large frame batch.
2. Build one coherent walk cycle per view from that model. Register shoulder/hip/head landmarks and planted paw baselines; do not normalize each frame by its entire bounding-box height, which can change apparent body size when legs shorten.
3. Add intermediate heading/turn poses with weight transfer and a planted pivot paw. Keep volume through the turn instead of scaling a flat image.
4. Pack and review in the actual garden at display size, including rapid direction reversals and simultaneous view changes. Check contact, stride timing, head size, color, and silhouette continuity together.
