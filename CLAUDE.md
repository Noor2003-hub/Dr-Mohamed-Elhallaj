@AGENTS.md

# Project brief — Dr. Mohamed Elhallaj website

- **Owner:** Noor builds this for Dr. Mohamed Abdellatif Elhallaj, a physiotherapist and co-founder of Experts Physio House (Alexandria).
- **Language:** reply to Noor in **Egyptian Arabic**. All site copy is English.
- **Working style:** don't ask permission before making changes. Make them, then tell her what changed.
- **Content:** use only data from the doctor's CV or data Noor gives. Anything missing becomes a visible placeholder like `[Phone]`; never invent facts. Avoid repeating the same information in two places.
- **Design reference:** the approved design is in `design/` (`Final.dc.html` holds all copy and styles; the PDF shows the full page). Image paths in `Final.dc.html` are from the design tool; the real images are in the import folder (`src/import/images`) and `public/`.
- **Focus: the animations.** See the "Animations" table in README.md. They are built with GSAP ScrollTrigger + Lenis (`src/lib/gsap.ts`). Keep `prefers-reduced-motion` support whenever you change one.
- **Stack:** Next.js 16 App Router + Payload 3.93 with SQLite (`@payloadcms/db-sqlite`).
  - Content is fetched server-side in `src/lib/data.ts` and passed to the section components in `src/components`.
  - After changing collections or globals, run `npm run generate:types`.
  - When adding a field the doctor should edit, add it to the collection or global, map it in `data.ts`, and add its value to `src/import/content.json` and `src/import/index.ts`.
- **Colours and fonts:**
  - Navy `#032D3B`, ink `#0E2A33`, light `#EEF2F0`, cyan `#2BB3D6`, teal `#0B6E91`, orange `#F26B3A`.
  - Bricolage Grotesque for headings, Archivo for body text. Tokens are at the top of `src/app/(frontend)/styles.css`.

## Still pending (from the doctor)

- Real Wan 2.2 clinic video to replace the placeholder frames in `public/sequence/story` (see README).
- Alyasmen center logo.
- YouTube link.
- Reel covers for 4 reels.
- One line of intro for the reels section.
- Body map photos with the new patient.
- Google Maps links for both branches.
- Licences for the tool photos, which look like stock images.
- Confirm the tool tags; Claude wrote them, not the doctor.
