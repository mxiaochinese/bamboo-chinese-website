# Design QA — Bamboo Chinese course detail

## Reference and implementation

- Visual reference: https://mxiao.edu.vn/khoa-hoc/so-cap-0-hsk3
- Bamboo implementation: http://localhost:4173/lo-trinh/yct-1/
- Desktop review viewport: 1280 × 720 CSS px
- Mobile review viewport: 390 × 844 CSS px
- Review states: page top, course overview, curriculum, expanded FAQ, mobile stacked layout

## Visual comparison

The Bamboo implementation follows the reference page's information architecture and visual rhythm: breadcrumb and two-column course hero, prominent textbook artwork, compact overview dashboard, a sticky tuition/materials panel on desktop, continuous curriculum rows, teaching-method section, FAQ, teachers, and consultation form.

Intentional differences:

- Bamboo green/orange palette, logo, copy, YCT book artwork, and Gilroy typography replace MXiao branding.
- The curriculum is a flat ordered list of sessions, matching the user's explicit instruction to remove the separate “mốc” classification.
- MXiao-specific testimonial or student-ranking content is not copied where it does not fit Bamboo's current content.
- All images are local Bamboo assets; the implementation does not hotlink MXiao assets.

## Checks performed

- Desktop and mobile full-page structure compared against the reference.
- Hero, overview, tuition card, curriculum rows, FAQ, teacher strip, and form inspected as focused regions.
- Course-list link to YCT1 verified.
- FAQ expansion verified.
- Mobile horizontal overflow: none at 390 px.
- Console warnings/errors: none.
- Tuition copy verified as list price plus final discounted tuition; no “Giảm 500.000đ” label remains.
- YCT1 curriculum verified at 28 sessions; YCT6 verified through session 35.

## Iteration history

1. Replaced the earlier generic detail layout with the MXiao-inspired two-column course architecture.
2. Replaced grouped curriculum accordions with a single ordered session list.
3. Moved the mobile tuition card directly below course information so pricing is not buried after the curriculum.
4. Tightened responsive spacing and removed horizontal overflow.

## Result

Passed. No P0, P1, or P2 issues remain. The full-width Chinese parentheses retained in lesson titles are source-content typography and are non-blocking.
