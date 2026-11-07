# Video & image guide

This guide covers three pieces. The keyframes for each are in the video kit (`elhallaj-video-kit.zip`).

| # | What | Made with | Goes to |
|---|---|---|---|
| 1 | Hero → About clinic video (2 clips) | 1 new image + Wan 2.2 first/last frame | `public/sequence/story/` |
| 2 | Experience track: recovery walk (6 clips) | Wan 2.2 first/last frame on green | `public/sequence/track/` |
| 3 | Child photo for "Where does it hurt?" | image generator | `public/img/body/kids.jpg` |

## Settings for every Wan clip

- **Mode:** first + last frame (FLF2V, "start and end frame"). Upload the two PNGs from the kit as they are, without cropping.
- **Size:** 1280 × 720 (16:9). All kit frames are already this size.
- **Length:** about 5 seconds per clip. 81 frames at 16 fps is the usual Wan 2.2 setting.
- **Seed:** use the same seed for every clip in a set, so lighting and faces stay consistent.
- **Negative prompt** (all clips):
  > text, subtitles, logo, watermark, extra people, extra limbs, deformed hands, distorted face, face changing, clothes changing colour, flicker, camera shake, fast cuts, blurry, low quality
- If a clip morphs or warps in the middle, generate it again with a new seed rather than lengthening it. Shorter clips stay cleaner.

---

## 1. Hero → About (two clips)

The story the site tells while you scroll:

1. Close on the patient's injured knee in the brace (the red pain glow is added by the site, not the video).
2. The camera pulls back. The doctor comes in and kneels to examine the knee.
3. The doctor stands, walks to the centre of the clinic, turns to camera with arms crossed.
4. The camera pushes in until he is framed **head to knees**. This hides the leg proportions.

### Step 1: make keyframe B (doctor kneeling, wide)

Keyframes A and C are ready in the kit. B only exists as a vertical image, so you need to widen it.

- **Upload:** `B-template-outpaint-to-16x9.png`. Also attach `A-ref-hero-wide.png` and `C-ref-about-full.png` as style references.
- **Tool:** ChatGPT / Gemini image editing, Photoshop Generative Expand, or any outpainting tool.
- **Prompt:**
  > Extend this photo to the left and right to fill the white areas, keeping the centre exactly as it is. Same dark teal physiotherapy clinic at night as the reference images: dark windows, teal treatment bed, blue exercise balls, shelves with folded towels, parallel bars on the right. Same moody low-key lighting and colour grade. The doctor (navy polo shirt, navy trousers, white sneakers) kneels and holds the patient's knee; the patient (white and light-blue t-shirt, black shorts, black hinged knee brace with a white plaster on the kneecap) sits on the edge of the treatment bed, a wheelchair beside him. Photorealistic, 16:9, no text.
- **Save as:** `B-kneel-wide.png` at 1280 × 720.
- **Check before going on:**
  - The patient's brace and plaster match image A (same leg, same side).
  - The doctor wears the **navy polo**, not scrubs.
  - The room matches A and C.

### Clip 1: A → B

- **First frame:** `A-start-knee-closeup.png`
- **Last frame:** `B-kneel-wide.png`
- **Prompt:**
  > Slow cinematic camera pull-back from a close-up of a patient's knee in a hinged post-operative brace, revealing him sitting on the edge of a teal treatment bed in a dark, moody physiotherapy clinic at night. A physiotherapist in a navy polo walks in from the side, kneels in front of the patient and gently holds the injured knee to examine it. Smooth dolly-out, steady camera, realistic motion, soft low-key lighting, photorealistic.

### Clip 2: B → C

- **First frame:** `B-kneel-wide.png`
- **Last frame:** `C-end-doctor-to-knees.png`
- **Prompt:**
  > The physiotherapist in a navy polo stands up from kneeling beside the patient, walks calmly to the centre of the dark teal clinic, turns to face the camera, crosses his arms and smiles confidently. The camera slowly pushes in and ends on a medium shot of him from head to knees. Steady smooth camera, natural walking, realistic, low-key moody lighting, photorealistic.

If the patient should leave the frame in clip 2, add: *"the patient stays seated on the bed and moves out of frame as the camera follows the doctor"*.

### Putting it on the site

```bash
# join the two clips (same size and fps)
printf "file 'clip1.mp4'\nfile 'clip2.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy story.mp4

# frames for the scroll player
rm public/sequence/story/*.webp
ffmpeg -i story.mp4 -vf "fps=30,scale=1600:-2" -c:v libwebp -quality 72 public/sequence/story/%04d.webp
ls public/sequence/story/*.webp | wc -l   # → FRAME_COUNT in src/components/Story.tsx
```

- **Frame count:** about 150–300 frames is the right range. If you get more, use `fps=24`.
- **Glow:** the red glow follows the knee using `public/sequence/story/glow.json`. Send the final `story.mp4` to Claude and it will rebuild that file for the new frames.
- **Timing:** if the About text appears too early or too late, change `ABOUT_IN` at the top of `Story.tsx`.

---

## 2. Experience track: the recovery walk

Right now the track shows 7 still figures. With a video, one patient figure walks along the track while you scroll. He goes from wheelchair → two crutches → one crutch → walking → walking alone → running → kicking the ball.

The kit has T1–T7, each figure on **pure green** at the same size and the same ground line. Make 6 clips, each from one figure to the next. Use the same seed and the same negative prompt as above, plus: *"background changes, shadows, floor, scenery"*.

**Start every prompt with this line:**
> Side view, full body, plain flat chroma-green background that never changes, static camera, the figures stay centred and move in place as if on a treadmill, photorealistic.

| Clip | First → last | Add to the prompt |
|---|---|---|
| 1 | T1 → T2 | The physiotherapist in navy pushes the patient in a wheelchair, stops, and helps him stand up onto two crutches; they start walking together. |
| 2 | T2 → T3 | The patient walks with two crutches beside the physiotherapist, then hands one crutch to him and continues with one crutch while they talk. |
| 3 | T3 → T4 | The patient leans the last crutch away and walks on his own with kinesiology tape on his knee, the physiotherapist close behind. |
| 4 | T4 → T5 | The physiotherapist slows down and watches proudly as the patient walks ahead confidently. |
| 5 | T5 → T6 | The patient speeds up from walking into an easy jog, then a run; the physiotherapist stays behind and out of frame. |
| 6 | T6 → T7 | The running patient slows, plants his foot and kicks a football. |

**Before you start:**
- **T1–T5 have the doctor in navy scrubs, but the hero and About now show him in a navy polo.** Decide which one he wears and regenerate those figures if needed. Do it before making the clips, so the outfit doesn't change halfway.
- T5 also still has text on the scrub to remove.

**Remove the green and export with transparency:**

```bash
printf "file 'track1.mp4'\nfile 'track2.mp4'\nfile 'track3.mp4'\nfile 'track4.mp4'\nfile 'track5.mp4'\nfile 'track6.mp4'\n" > track.txt
ffmpeg -f concat -safe 0 -i track.txt -c copy track.mp4
mkdir -p public/sequence/track
ffmpeg -i track.mp4 -vf "fps=24,chromakey=0x00B140:0.12:0.08,despill=type=green,scale=900:-2,format=yuva420p" \
  -c:v libwebp -lossless 0 -quality 75 public/sequence/track/%04d.webp
```

Then send the frames, or `track.mp4`, to Claude to connect the walking figure to the track scroll.

---

## 3. Child photo for "Where does it hurt?"

When someone picks **Whole-body pediatric rehab**, the body map switches to this photo. The site already supports it; until the file exists it falls back to the adult photo.

- **Attach:** `ref-adult-front.jpg` from the kit.
- **Prompt:**
  > A photo in exactly the same style, framing and lighting as the reference: a boy about 8 years old standing straight, facing the camera, full body from head to shoes, arms relaxed slightly away from the body, feet hip-width apart, neutral friendly expression. He wears a fitted plain white t-shirt, black sports shorts to the knee and dark sneakers. Plain light grey studio background, soft even light, centred, lots of space around him so his whole body fits in the lower three quarters of the frame. Vertical 9:16, photorealistic, no text.
- **Save as:** `public/img/body/kids.jpg`, vertical 941 × 1672 (any 9:16 works).
- **Fit:** the child should take up about the same area as the adult photo, so the area buttons around him still line up.
