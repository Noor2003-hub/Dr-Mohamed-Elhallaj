# Dr. Mohamed Elhallaj — website

Next.js 16 + Payload CMS 3 (SQLite). Everything the doctor edits lives in the admin panel at `/admin`.

## Run it

```bash
npm install
cp .env.example .env          # then put a long random string in PAYLOAD_SECRET
npm run import                # fills the CMS from src/import/content.json
npm run dev                   # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

The first time you open `/admin` it asks you to create the admin user.

## The import file

All of the doctor's content is in **`src/import/content.json`**, with its images in **`src/import/images/`**:

- site texts, hero, About, contact and the Experts Physio House details
- certificates (each has a `key`), body areas (they list certificate keys), tools, workplaces, reels and clinic branches

Image fields hold a file name from `src/import/images` (`""` means no image).

`npm run import` checks the whole file first: missing images, unknown certificate keys and similar problems. If anything is wrong it stops without changing anything. If everything is fine, it **replaces** all content and the site settings with what's in the file. Admin users are kept.

After the first import, edit in `/admin`. Running the import again would overwrite those edits.

## What the doctor can edit (admin → Content / Settings)

| In the admin | On the site |
|---|---|
| Site settings → Doctor & hero | name, hero lines, logos |
| Site settings → About | the story lines that focus one by one, +18 years, consultant text |
| Site settings → Experts Physio House | clinic name (EN/AR), "Co-founder", logo, Instagram |
| Site settings → Contact & social | WhatsApp, email, location, Instagram, YouTube, contact photo |
| Site settings → Section texts | every section heading and intro |
| Tools in the clinic | the stacked cards (order, tag, title, photo, description) |
| Body map areas | each area's name, front/back view and which certificates show |
| Education & certificates | degrees, diplomas (with "in progress"), courses |
| Experience (track stations) | workplace, years, role, logo, "current" (orange) |
| Instagram reels | link, title, Arabic/English direction, views, tag, cover |
| Clinic branches | address, phones, hours, Google Maps link, map area, colour |

Every list has an **Order** number (lower shows first) and a **Visible** switch.

## Animations (where to look)

| Section | File | What happens |
|---|---|---|
| Smooth scroll + fade-ups | `components/SmoothScroll.tsx` | Lenis + GSAP ScrollTrigger; any element with `data-reveal` fades up |
| Hero → About video | `components/Story.tsx` | one pinned canvas that scrubs an image sequence with the scroll, pulsing pain glow on the knee, hero text drifts away, About fades in, story lines focus one by one, +18 counts up |
| Body map | `components/BodyMap.tsx` | front/back photo crossfade, kinesio tape "sticks on" strip by strip |
| Tools | `components/Tools.tsx` | section pins; each scroll step slides the next card over the stack (like Omar's capabilities) |
| Reels | `components/Reels.tsx` + `Grainient.tsx` | animated colour blobs with grain, filter chips |
| Track | `components/Track.tsx` | section pins and the track slides sideways; recovery figures step in; stations light up as you pass |
| Experts Physio House | `components/Clinics.tsx` | spinning co-founder seal; real CSS‑3D map tilts back and the two branch areas rise one after the other |

All animations respect `prefers-reduced-motion`.

## Replacing the placeholder video

The hero → About "video" is an image sequence in `public/sequence/story/` (`0001.webp` … `0160.webp`).
Right now those frames are made from the still images (zoom + crossfade). When the real Wan 2.2 video is ready:

```bash
rm public/sequence/story/*.webp
ffmpeg -i story.mp4 -vf "fps=30,scale=1600:-2" -c:v libwebp -quality 72 public/sequence/story/%04d.webp
ls public/sequence/story/*.webp | wc -l     # put this number in FRAME_COUNT in components/Story.tsx
```

The video should start close on the knee, pull back, show the doctor kneeling, then end with him standing in the middle of the room, framed down to the knees.
`public/sequence/story/glow.json` positions the red pain glow on the knee for each frame (x, y as a share of the frame, then zoom). For the real video, set the first frames' values to where the kneecap is, and use `null` once the glow should be gone.

## Other static images

- `public/img/body/front.jpg`, `back.jpg`: body map photos. The tape positions are in `TAPES` at the top of `components/BodyMap.tsx`; adjust them if the photos change.
- `public/img/track/t1–t7.png`: recovery figures on the track.
- `public/map/alexandria-east.jpg`: map of eastern Alexandria (© OpenStreetMap contributors). The two raised areas are in `src/lib/mapgeo.json`.

## Deploying

SQLite is fine locally. For Vercel, switch the adapter in `src/payload.config.ts` to `@payloadcms/db-postgres` (or Mongo), and put media on Vercel Blob or S3 storage.
