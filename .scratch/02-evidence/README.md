# Ticket 02 review evidence

Captured from the local `develop` working tree using `tests/garden-view-browser.cjs`. Test fixtures are generated data, isolated from any player's browser storage. Screenshots use system-font fallbacks.

## Typical phone

- [Garden](garden-390x844.png)
- [Plant inspection](inspection-390x844.png)
- [Run with garden-return control](run-390x844.png)
- [Queued return during a shot](queued-return.png)

## Small phone and landscape

- [Small garden](garden-320x568.png)
- [Small inspection](inspection-320x568.png)
- [Small run](run-320x568.png)
- [Landscape inspection](inspection-568x320.png)
- [Landscape run](run-568x320.png)

The directory also contains garden/inspection/run images for 375 × 667, 430 × 932, and 1024 × 768. The browser suite checks actual element bounds and saved state, not just images. Safe-area tests use simulated padding; physical iPhone acceptance remains outstanding.
