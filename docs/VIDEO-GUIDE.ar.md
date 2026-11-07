<div dir="rtl">

# دليل الفيديوهات والصور

الدليل ده بيغطي 3 حاجات، والكادرات بتاعتهم في ملف `elhallaj-video-kit.zip`.

> **ملحوظة:** البرومبتات سايباها بالإنجليزي عن قصد. Wan وأدوات توليد الصور بتفهم الإنجليزي أحسن بكتير، فانسخيها زي ما هي.

| # | إيه | بيتعمل بـ | بيتحط فين |
|---|---|---|---|
| 1 | فيديو العيادة من الهيرو لـ About (فيديوهين) | صورة واحدة جديدة + Wan 2.2 بأول وآخر كادر | `public/sequence/story/` |
| 2 | الـ track: مشوار التعافي (6 فيديوهات) | Wan 2.2 بأول وآخر كادر على خلفية خضرا | `public/sequence/track/` |
| 3 | صورة الطفل لسكشن "Where does it hurt?" | أداة توليد صور | `public/img/body/kids.jpg` |

## إعدادات كل فيديو في Wan

- **الوضع:** أول كادر + آخر كادر (FLF2V أو "start and end frame"). ارفعي الصورتين من الـ kit زي ما هما من غير قص.
- **المقاس:** ‎1280 × 720 (‏16:9). كل الكادرات في الـ kit المقاس ده أصلًا.
- **الطول:** حوالي 5 ثواني لكل فيديو. الإعداد المعتاد في Wan 2.2 هو 81 فريم على 16 فريم في الثانية.
- **الـ Seed:** استخدمي نفس الـ seed لكل فيديوهات المجموعة الواحدة، عشان الإضاءة والوشوش تفضل ثابتة.
- **الـ Negative prompt** لكل الفيديوهات:

<div dir="ltr">

> text, subtitles, logo, watermark, extra people, extra limbs, deformed hands, distorted face, face changing, clothes changing colour, flicker, camera shake, fast cuts, blurry, low quality

</div>

- لو فيديو حصل فيه تشويه أو تحوّل غريب في النص، اعمليه تاني بـ seed مختلف بدل ما تطوليه. الفيديو القصير بيطلع أنضف.

---

## 1. من الهيرو لـ About (فيديوهين)

دي الحكاية اللي الموقع بيحكيها وإنتي بتعملي سكرول:

1. لقطة قريبة على ركبة المريض المصابة في الدعامة. التوهج الأحمر الموقع هو اللي بيضيفه، مش الفيديو.
2. الكاميرا بترجع لورا، والدكتور بيدخل ويركع يكشف على الركبة.
3. الدكتور بيقوم ويمشي لنص العيادة، وبيلف للكاميرا وهو مربّع إيديه.
4. الكاميرا بتقرّب لحد ما يبقى باين **من راسه لركبه**، وده بيخبي مشكلة طول الرجلين.

### الخطوة 1: اعملي الكادر B (الدكتور راكع، بالعرض)

الكادرين A وC جاهزين في الـ kit. أما B فموجود بس كصورة طولية، فلازم توسّعيها.

- **ارفعي:** `B-template-outpaint-to-16x9.png`، وكمان `A-ref-hero-wide.png` و`C-ref-about-full.png` كمرجع للستايل.
- **الأداة:** التعديل في ChatGPT أو Gemini، أو Generative Expand في فوتوشوب، أو أي أداة outpainting.
- **البرومبت:**

<div dir="ltr">

> Extend this photo to the left and right to fill the white areas, keeping the centre exactly as it is. Same dark teal physiotherapy clinic at night as the reference images: dark windows, teal treatment bed, blue exercise balls, shelves with folded towels, parallel bars on the right. Same moody low-key lighting and colour grade. The doctor (navy polo shirt, navy trousers, white sneakers) kneels and holds the patient's knee; the patient (white and light-blue t-shirt, black shorts, black hinged knee brace with a white plaster on the kneecap) sits on the edge of the treatment bed, a wheelchair beside him. Photorealistic, 16:9, no text.

</div>

- **احفظيها باسم:** `B-kneel-wide.png` بمقاس ‎1280 × 720.
- **راجعي قبل ما تكمّلي:**
  - الدعامة واللزقة على نفس الرجل ونفس الناحية زي الصورة A.
  - الدكتور لابس **البولو الكحلي** مش السكرب.
  - شكل العيادة زي A وC.

### الفيديو 1: من A لـ B

- **أول كادر:** `A-start-knee-closeup.png`
- **آخر كادر:** `B-kneel-wide.png`
- **البرومبت:**

<div dir="ltr">

> Slow cinematic camera pull-back from a close-up of a patient's knee in a hinged post-operative brace, revealing him sitting on the edge of a teal treatment bed in a dark, moody physiotherapy clinic at night. A physiotherapist in a navy polo walks in from the side, kneels in front of the patient and gently holds the injured knee to examine it. Smooth dolly-out, steady camera, realistic motion, soft low-key lighting, photorealistic.

</div>

### الفيديو 2: من B لـ C

- **أول كادر:** `B-kneel-wide.png`
- **آخر كادر:** `C-end-doctor-to-knees.png`
- **البرومبت:**

<div dir="ltr">

> The physiotherapist in a navy polo stands up from kneeling beside the patient, walks calmly to the centre of the dark teal clinic, turns to face the camera, crosses his arms and smiles confidently. The camera slowly pushes in and ends on a medium shot of him from head to knees. Steady smooth camera, natural walking, realistic, low-key moody lighting, photorealistic.

</div>

لو عايزة المريض يطلع برا الكادر في الفيديو 2، ضيفي للبرومبت:

<div dir="ltr">

*"the patient stays seated on the bed and moves out of frame as the camera follows the doctor"*

</div>

### تحطيه في الموقع إزاي

<div dir="ltr">

```bash
# join the two clips (same size and fps)
printf "file 'clip1.mp4'\nfile 'clip2.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy story.mp4

# frames for the scroll player
rm public/sequence/story/*.webp
ffmpeg -i story.mp4 -vf "fps=30,scale=1600:-2" -c:v libwebp -quality 72 public/sequence/story/%04d.webp
ls public/sequence/story/*.webp | wc -l   # → FRAME_COUNT in src/components/Story.tsx
```

</div>

- **عدد الفريمات:** الرقم اللي بيطلع من آخر أمر حطيه في `FRAME_COUNT` في `Story.tsx`. الأحسن يكون ما بين 150 و300 فريم، ولو طلع أكتر استخدمي `fps=24`.
- **التوهج:** التوهج الأحمر بيمشي مع الركبة عن طريق ملف `public/sequence/story/glow.json`. ابعتي `story.mp4` النهائي لـ Claude وهيعمل الملف ده من جديد على الفريمات الجديدة.
- **التوقيت:** لو كلام About ظهر بدري أو متأخر، غيّري `ABOUT_IN` في أول `Story.tsx`.

---

## 2. الـ track: مشوار التعافي

دلوقتي الـ track فيه 7 figures ثابتة. بالفيديو، هيبقى فيه مريض واحد بيمشي على الـ track وإنتي بتعملي سكرول: كرسي متحرك ← عكازين ← عكاز واحد ← مشي ← مشي لوحده ← جري ← بيشوط الكورة.

في الـ kit فيه من T1 لـ T7، وكل figure على **أخضر سادة** بنفس الحجم ونفس خط الأرض. اعملي 6 فيديوهات، كل واحد من figure للي بعدها. استخدمي نفس الـ seed ونفس الـ negative prompt اللي فوق، وضيفي عليهم:

<div dir="ltr">

*"background changes, shadows, floor, scenery"*

</div>

**ابدأي كل برومبت بالسطر ده:**

<div dir="ltr">

> Side view, full body, plain flat chroma-green background that never changes, static camera, the figures stay centred and move in place as if on a treadmill, photorealistic.

</div>

| الفيديو | من ← لـ | ضيفي للبرومبت |
|---|---|---|
| 1 | T1 ← T2 | <span dir="ltr">The physiotherapist in navy pushes the patient in a wheelchair, stops, and helps him stand up onto two crutches; they start walking together.</span> |
| 2 | T2 ← T3 | <span dir="ltr">The patient walks with two crutches beside the physiotherapist, then hands one crutch to him and continues with one crutch while they talk.</span> |
| 3 | T3 ← T4 | <span dir="ltr">The patient leans the last crutch away and walks on his own with kinesiology tape on his knee, the physiotherapist close behind.</span> |
| 4 | T4 ← T5 | <span dir="ltr">The physiotherapist slows down and watches proudly as the patient walks ahead confidently.</span> |
| 5 | T5 ← T6 | <span dir="ltr">The patient speeds up from walking into an easy jog, then a run; the physiotherapist stays behind and out of frame.</span> |
| 6 | T6 ← T7 | <span dir="ltr">The running patient slows, plants his foot and kicks a football.</span> |

**قبل ما تبدأي:**
- **في T1 لـ T5 الدكتور لابس سكرب كحلي، أما في الهيرو والـ About فلابس بولو كحلي.** قرري هيلبس إيه، ولو محتاجة اعملي الـ figures دي تاني. اعملي ده قبل الفيديوهات عشان اللبس ميتغيرش في النص.
- T5 لسه عليها الكتابة اللي على السكرب ومحتاجة تتشال.

**شيلي الأخضر وطلّعي الفريمات شفافة:**

<div dir="ltr">

```bash
printf "file 'track1.mp4'\nfile 'track2.mp4'\nfile 'track3.mp4'\nfile 'track4.mp4'\nfile 'track5.mp4'\nfile 'track6.mp4'\n" > track.txt
ffmpeg -f concat -safe 0 -i track.txt -c copy track.mp4
mkdir -p public/sequence/track
ffmpeg -i track.mp4 -vf "fps=24,chromakey=0x00B140:0.12:0.08,despill=type=green,scale=900:-2,format=yuva420p" \
  -c:v libwebp -lossless 0 -quality 75 public/sequence/track/%04d.webp
```

</div>

بعد كده ابعتي الفريمات أو `track.mp4` لـ Claude عشان يربط المريض اللي بيمشي بالسكرول بتاع الـ track.

---

## 3. صورة الطفل لسكشن "Where does it hurt?"

لما حد يختار **Whole-body pediatric rehab**، خريطة الجسم بتقلب على الصورة دي. الموقع جاهز لها، ولحد ما الملف يتحط بيعرض صورة الكبير.

- **ارفعي:** `ref-adult-front.jpg` من الـ kit كمرجع.
- **البرومبت:**

<div dir="ltr">

> A photo in exactly the same style, framing and lighting as the reference: a boy about 8 years old standing straight, facing the camera, full body from head to shoes, arms relaxed slightly away from the body, feet hip-width apart, neutral friendly expression. He wears a fitted plain white t-shirt, black sports shorts to the knee and dark sneakers. Plain light grey studio background, soft even light, centred, lots of space around him so his whole body fits in the lower three quarters of the frame. Vertical 9:16, photorealistic, no text.

</div>

- **احفظيها باسم:** `public/img/body/kids.jpg`، طولية بمقاس ‎941 × 1672 (أي مقاس 9:16 ينفع).
- **المقاس جوه الصورة:** خلي الطفل واخد تقريبًا نفس المساحة اللي الكبير واخدها في صورته، عشان أزرار المناطق اللي حواليه تفضل في مكانها.

</div>
