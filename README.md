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
| Track | `components/Track.tsx` | section pins and the track slides sideways under the recovery walk video, which plays with the scroll in the middle; stations light up as you pass |
| Experts Physio House | `components/Clinics.tsx` | spinning co-founder seal; real CSS‑3D map tilts back and the two branch areas rise one after the other |

All animations respect `prefers-reduced-motion`.

## The hero → About video

The hero → About "video" is an image sequence in `public/sequence/story/` (`0001.webp` … `0231.webp`).
It is made from the two clips in `public/videos/` (clip 1: knee → doctor kneeling; clip 2: doctor stands → arms crossed, `clip2-doctor-face-fixed.mp4`),
joined with a 0.33 s crossfade, and cropped at the bottom to hide the KlingAI watermark:

```bash
rm public/sequence/story/*.webp
ffmpeg -i public/videos/kling_20261108_VIDEO_Slow_cinem_0_0.mp4 -i public/videos/clip2-doctor-face-fixed.mp4 \
  -filter_complex "[0:v]settb=1/24,setpts=N/24/TB,fps=24[a];[1:v]settb=1/24,setpts=N/24/TB,fps=24[b];[a][b]xfade=transition=fade:duration=0.33:offset=4.7,crop=1280:656:0:0" \
  -c:v libwebp -quality 74 public/sequence/story/%04d.webp
ls public/sequence/story/*.webp | wc -l     # put this number in FRAME_COUNT in components/Story.tsx
```

`public/sequence/story/glow.json` positions the red pain glow on the knee for each frame (x, y as a share of the frame, then zoom), and is `null` once the glow is gone.
`FOCUS` at the top of `Story.tsx` tells the crop what to keep in view on narrow screens (the knee first, then the doctor). If the clips change, both need updating.

## The recovery walk (Experience track)

One patient walks the track from wheelchair to kicking a football while you scroll. It is an image sequence with transparency in `public/sequence/track/` (`0001.webp` … `0290.webp`), made from the six green-screen clips in `public/sequence/vidoes/`, joined in this order: helping → walking with crutch → walking without crutches → watches → speeds up → kicks.

```bash
cd public/sequence/vidoes
for f in Physio*helping* Patient_walking_with_crutch* Patient_walking_without* Physio*watches* Patient_speeds* Patient_kicks*; do echo "file '$PWD/$f'"; done > /tmp/list.txt
mkdir -p /tmp/key && ffmpeg -f concat -safe 0 -i /tmp/list.txt   -vf "fps=16,scale=1280:720:flags=lanczos,chromakey=0x05AD48:0.13:0.06,despill=type=green,format=rgba" /tmp/key/%04d.png
cd ../../.. && rm public/sequence/track/*.webp
ffmpeg -i /tmp/key/%04d.png -vf "crop=1200:640:80:70,scale=960:512:flags=lanczos" -c:v libwebp -quality 78 -pix_fmt yuva420p public/sequence/track/%04d.webp
ls public/sequence/track/*.webp | wc -l   # put this number in WALK_FRAMES in components/Track.tsx
```

The crop keeps the area the people use in every clip. In `styles.css`, `.track__walk` puts the feet (92% down the frame) on the lane.

## Other static images

- `public/img/body/front.png`, `back.png`: transparent body map photos. Blue region layers use the SVG paths in `REGIONS` in `src/components/BodyMap.tsx`, masked to the photo's silhouette.
- `public/map/alexandria-east.jpg`: map of eastern Alexandria (© OpenStreetMap contributors). The two raised areas are in `src/lib/mapgeo.json`.

## Deploying

The site uses local SQLite in development and hosted SQLite (Turso) on Vercel. Set `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `PAYLOAD_SECRET`, and `BLOB_READ_WRITE_TOKEN` in Vercel. Media is served from Vercel Blob.

Manage the contact section and footer links under **Content → Contact items** in Payload. Each item has an English/Arabic title, optional details, a link, a country group, and an order. Empty links stay hidden except location text. The initial Facebook, TikTok, and Egyptian WhatsApp links are intentionally empty. `scripts/setup-contact-items.mjs` adds this collection's database tables and initial items without replacing existing content.

The developer credit in the footer is fixed in `src/components/Footer.tsx` and is not editable in Payload.
