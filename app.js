/* ============================================================
   618 MEDIA ACTION PLAN
   Single-file client app. No backend. Data lives in this
   browser's localStorage (key below). See README.md for how
   import/export and the passphrase gate work.
============================================================ */

// ---------- Config ----------

const STORAGE_KEY = '618-media-tasks-v1';

// Passphrase gate: NOT real security (this is a public static site,
// anyone with devtools can read the source). It just stops a random
// visitor who finds the URL from browsing your client quotes.
// Change the default before you push this repo. See README.md for
// the one-line snippet to generate a new hash.
const GATE_ENABLED = true;
const GATE_HASH = 'ae78a9a893584a27f1d190eb1580e7f3dcf16a8dc82268fed22626b09e33d307'; // passphrase set by Amro, 13 Aug 2026

const CATEGORIES = [
  'URGENT / BUGS',
  'CLIENT FOLLOW-UPS',
  'CALCULATOR / PRODUCT',
  'CONTENT PRODUCTION (INSTAGRAM / REELS)',
  'STRATEGY / BUSINESS DECISIONS',
  'STANDING RULES / SYSTEMS',
  'DONE',
];

const ASSIGNEES = ['Unassigned', 'Amro', 'Daniel', 'Both'];

const NAME_ALIASES = {
  danny: 'daniel', dan: 'daniel', daniel: 'daniel', herrera: 'daniel',
  amro: 'amro', mohi: 'amro', me: 'amro',
};

const CATEGORY_KEYWORDS = {
  'URGENT / BUGS': ['urgent', 'bug', 'broken', 'fix asap', 'deploy', 'deployment', 'live site', 'error', 'glitch', 'xss', 'crash', 'down'],
  'CLIENT FOLLOW-UPS': ['gerry', 'byrne', 'choir', 'fadi', 'emre', 'moubayed', 'turcan', 'client', 'quote', 'follow up', 'followup', 'testimonial', 'outreach', 'pli', 'insurance', 'permit', 'council', 'clovelly', 'coogee', 'randwick', 'interview booking', 'lead'],
  'CALCULATOR / PRODUCT': ['calculator', 'pricing', 'tier', 'estimate', 'add-on', 'addon', 'complexity', 'rush surcharge', '618 session', 'music style', 'slider', 'threshold'],
  'CONTENT PRODUCTION (INSTAGRAM / REELS)': ['instagram', 'reel', 'caption', 'video', 'shoot', 'film', 'tofu', 'mofu', 'bofu', 'highlight', 'story', 'stories', 'carousel', 'colour grading', 'color grading', 'dj snake', 'adidas', 'beastie boys', 'asap rocky', 'origin story', 'chef joe', 'post'],
  'STRATEGY / BUSINESS DECISIONS': ['release plan', 'price floor', 'specialisation', 'specialization', 'retainer', 'strategy', 'positioning', 'check-in', 'checkin', 'revenue'],
  'STANDING RULES / SYSTEMS': ['skill file', 'em dash', 'brand colour', 'brand color', 'carousel skill', 'proofread', 'funnel-content', 'standing rule', 'hook'],
};

// ---------- Seed data (parsed from the 13 Aug 2026 master action plan) ----------

const DEFAULT_TASKS = [
  {
    "id": "1786574150700-w7y36",
    "text": "Test video-calculator-fixed.html on a Squarespace staging page: click through Music, Event, Social, and Real Estate flows end to end.",
    "category": "URGENT / BUGS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150700
  },
  {
    "id": "1786574150700-9wwj5",
    "text": "Once verified, push the calculator live and confirm it is the version actually running in the Squarespace Code Block on /my-video-calculator. It was rebuilt several times this session, so confirm the live site has the final version, not an earlier one. This is the fix for the bug that was silently underquoting leads (not just Gerry's), so it is the single highest priority item on this whole list.",
    "category": "URGENT / BUGS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150701
  },
  {
    "id": "1786574150700-zkkvi",
    "text": "Correct Whole Night's view count everywhere it still shows 750K or 753K: Instagram bio draft, captions, the deck, and the checklist PDF. Real number is 1,046,651, use \"1M+\" as the standard rounded figure. This was deliberately deferred until after the origin story script, that work is done, so this is now due.",
    "category": "URGENT / BUGS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150702
  },
  {
    "id": "1786574150700-cxq0c",
    "text": "Confirm the correct artist and title for \"Farside - Drop\" before publishing caption 8 in the reaction video series. Could not verify this credit independently.",
    "category": "URGENT / BUGS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150703
  },
  {
    "id": "1786574150700-t8pva",
    "text": "Decide whether Rubber Johnny content can be used publicly at all. Source video has body horror and drug references that likely will not clear platform content policies.",
    "category": "URGENT / BUGS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150704
  },
  {
    "id": "1786574150700-hhnuu",
    "text": "Send (or confirm already sent) the drafted message to Fadi to book his BTS and testimonial interview.",
    "category": "CLIENT FOLLOW-UPS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150705
  },
  {
    "id": "1786574150700-lg6rt",
    "text": "Send (or confirm already sent) the drafted message to Emre to book his testimonial interview for Kovala.",
    "category": "CLIENT FOLLOW-UPS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150706
  },
  {
    "id": "1786574150700-u7e4a",
    "text": "Confirm with Gerry or Danny whether the coastal shoot location is Clovelly or Coogee. This decides the Randwick Council permit application and whether the location scouting fee (+$400) applies.",
    "category": "CLIENT FOLLOW-UPS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150707
  },
  {
    "id": "1786574150700-zn9bc",
    "text": "Start the PLI insurance and Randwick Council notification/permit process for the coastal shoot once the location above is confirmed. First confirm whether 618 Media already carries PLI as standing business cover or whether this needs arranging fresh for this job. Mandatory per the brief, likely has lead time before the October 2026 shoot date, so start this as soon as possible rather than waiting on the quote below.",
    "category": "CLIENT FOLLOW-UPS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150708
  },
  {
    "id": "1786574150700-myqwl",
    "text": "Price the archival footage integration work manually. No mechanism for this in the calculator yet.",
    "category": "CLIENT FOLLOW-UPS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150709
  },
  {
    "id": "1786574150700-v3wlo",
    "text": "Decide whether the scouting fee applies now that the location question above is resolved.",
    "category": "CLIENT FOLLOW-UPS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150710
  },
  {
    "id": "1786574150700-guh6u",
    "text": "Send Gerry the itemised quote his brief asked for: pre-production/crew day rates, post-production rates, and travel/equipment fees broken out separately, not a single lump number. Base estimate is $9,100 to $12,300 (Music, Mid tier, drone, multiple locations, crowd, top headcount bracket, no rush), plus the PLI/permit and archival costs from the items above.",
    "category": "CLIENT FOLLOW-UPS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150711
  },
  {
    "id": "1786574150700-dcyk8",
    "text": "Build the creative recipe for each of the 5 618 Session music styles (performance, narrative, conceptual, visualiser, behind the scenes): shot list pattern, number of setups, coverage approach.",
    "category": "CALCULATOR / PRODUCT",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150712
  },
  {
    "id": "1786574150700-h3p4l",
    "text": "Decide on naming and branding for the package (working name: The 618 Session).",
    "category": "CALCULATOR / PRODUCT",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150713
  },
  {
    "id": "1786574150700-t0jyx",
    "text": "Once the 618 Session recipes are built, update the Music tier scope descriptions on the calculator to match the real rule: up to 2 locations equals 1 shoot day included, 3 to 4+ locations means a second shoot day at +$900.",
    "category": "CALCULATOR / PRODUCT",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150714
  },
  {
    "id": "1786574150700-ellps",
    "text": "Decide whether the multi-day slider should ever ask for an exact day count beyond \"5 or more,\" or whether the current band is enough.",
    "category": "CALCULATOR / PRODUCT",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150715
  },
  {
    "id": "1786574150700-dl4lq",
    "text": "Decide whether location scouting should be offered as an option in flows beyond Music and Corporate.",
    "category": "CALCULATOR / PRODUCT",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150716
  },
  {
    "id": "1786574150700-d3rgg",
    "text": "Decide whether the 30-minute call dollar threshold (currently $1,500) should move now that most tiers already start above that.",
    "category": "CALCULATOR / PRODUCT",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150717
  },
  {
    "id": "1786574150700-d2j2n",
    "text": "Switch to Professional Dashboard if not already done. Needed for Insights and the Inspiration tool used to find trending content.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "INSTAGRAM PROFILE SETUP",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150718
  },
  {
    "id": "1786574150700-qiqo1",
    "text": "Update the Instagram name and bio using the drafted copy block, with the corrected Whole Night view count from the Urgent section above.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "INSTAGRAM PROFILE SETUP",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150719
  },
  {
    "id": "1786574150700-g3lwu",
    "text": "Set the profile link to the Whole Night YouTube video. Swap to the landing page once it is built with the real sales video and process video.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "INSTAGRAM PROFILE SETUP",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150720
  },
  {
    "id": "1786574150700-hb3cy",
    "text": "Pin Whole Night, or its best cutdown, as the top grid post.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "INSTAGRAM PROFILE SETUP",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150721
  },
  {
    "id": "1786574150700-njg82",
    "text": "Create three Highlights: Behind the Scenes, Results, Process. Cover icons are already made and delivered as PNGs.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "INSTAGRAM PROFILE SETUP",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150722
  },
  {
    "id": "1786574150700-cds15",
    "text": "Decide whether Stories carry their own call to action (link sticker to Fadi's video or a DM prompt) or stay CTA free like the Reels.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "INSTAGRAM PROFILE SETUP",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150723
  },
  {
    "id": "1786574150700-hg7bq",
    "text": "Video 1, Amro's origin story (TOFU). Beat sheet and 20 question interview PDF are ready. Film with Daniel asking the questions, then cut both a longer About page version and a shorter Reel version.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "SIX CORE VIDEOS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150724
  },
  {
    "id": "1786574150700-lemlr",
    "text": "Video 2, reaction or hero figure post (TOFU). Pick a trending big budget video first using the checklist methods (Instagram Inspiration tool, Reels tab repetition, trending audio arrow, hashtag search sorted by Recent, TikTok Creative Center, follow @creators).",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "SIX CORE VIDEOS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150725
  },
  {
    "id": "1786574150700-dppea",
    "text": "Video 3, Whole Night behind the scenes (MOFU mechanism breakdown).",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "SIX CORE VIDEOS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150726
  },
  {
    "id": "1786574150700-9vada",
    "text": "Video 4, process explainer, \"what we ask before we pick up a camera\" (MOFU).",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "SIX CORE VIDEOS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150727
  },
  {
    "id": "1786574150700-wxoal",
    "text": "Video 5, Fadi client interview (BOFU). Depends on the Fadi outreach message above and a date locked in.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "SIX CORE VIDEOS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150728
  },
  {
    "id": "1786574150700-l4gro",
    "text": "Video 6, proof and results post (BOFU). Screen record the real YouTube analytics, using the corrected view count.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "SIX CORE VIDEOS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150729
  },
  {
    "id": "1786574150700-8ho12",
    "text": "Footage backfill: pull five to eight clips from past projects to fill the grid across weeks one and two while new content is being made.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "SIX CORE VIDEOS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150730
  },
  {
    "id": "1786574150701-vu85e",
    "text": "Danny answers his 14 questions in writing first, same process Amro went through, so the eventual script is built from his real answers and not generic placeholders.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "ORIGIN STORY, DANNY",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150731
  },
  {
    "id": "1786574150701-x7xi9",
    "text": "Once answered, rebuild his questions into an accurate beat sheet the same way Amro's was built.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "ORIGIN STORY, DANNY",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150732
  },
  {
    "id": "1786574150701-zaav9",
    "text": "Decide whether Rugrag podcast material is worth including in Danny's origin story content. Optional, his call once he answers the questions.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "ORIGIN STORY, DANNY",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150733
  },
  {
    "id": "1786574150701-7ceua",
    "text": "Film the 10 question joint casual chat. Goal is chemistry and friendship, not chronology, let it run loose and let tangents happen.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "JOINT CONTENT, AMRO AND DANNY",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150734
  },
  {
    "id": "1786574150701-08u76",
    "text": "Film the 13 question intercut TOFU introduction, both answering separately so the edit can cut between them. If time is short, prioritise: what were you doing before this became a real job, what do you actually disagree about creatively, and finish the sentence \"we make videos because.\"",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "JOINT CONTENT, AMRO AND DANNY",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150735
  },
  {
    "id": "1786574150701-bo4sf",
    "text": "Film and edit the colour grading before/after reel using the rebuilt overlay, sized correctly for a true 1080x1920 frame this time, not the undersized placeholder from the first attempt.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "COLOUR GRADING AND THE FADI CLIP",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150736
  },
  {
    "id": "1786574150701-n6t2s",
    "text": "Post the BTS caption and the colour grading caption, both already drafted using the pain point then solution structure.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "COLOUR GRADING AND THE FADI CLIP",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150737
  },
  {
    "id": "1786574150701-8tfhi",
    "text": "Pick final cut clips from the reel editing guide for each of the 9 segments.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "REACTION VIDEO SERIES (9-PART, ASAP ROCKY THROUGH BEASTIE BOYS)",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150738
  },
  {
    "id": "1786574150701-amtix",
    "text": "Publish the ASAP Rocky two-part cut with its own captions: Video 1 on the AI reveal hook, Video 2 on the rewatch and Bosch comparison hook.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "REACTION VIDEO SERIES (9-PART, ASAP ROCKY THROUGH BEASTIE BOYS)",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150739
  },
  {
    "id": "1786574150701-bptti",
    "text": "Swap the fuller Beastie Boys caption into the main 9-post set, replacing the earlier shorter Sabotage caption.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "REACTION VIDEO SERIES (9-PART, ASAP ROCKY THROUGH BEASTIE BOYS)",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150740
  },
  {
    "id": "1786574150701-43sbd",
    "text": "Decide whether the Beastie Boys behind the scenes caption (the $84,000 destroyed camera story) runs as its own standalone post or paired with the reaction clip.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "REACTION VIDEO SERIES (9-PART, ASAP ROCKY THROUGH BEASTIE BOYS)",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150741
  },
  {
    "id": "1786574150701-i2g55",
    "text": "Choose between the Eyecandy style technique captions (6 reels) and the fact based credits captions (6 reels), or decide which set runs for which reel.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "ADIDAS SUPERSTAR \"HOTEL SUPERSTAR\" BREAKDOWN SERIES",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150742
  },
  {
    "id": "1786574150701-siro0",
    "text": "Confirm there is no rights or clearance issue posting reaction content against a branded adidas campaign before publishing.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "ADIDAS SUPERSTAR \"HOTEL SUPERSTAR\" BREAKDOWN SERIES",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150743
  },
  {
    "id": "1786574150701-8bxp8",
    "text": "Verify Instagram handles for Islam Chipsy, Sven Grummel, and Nicolas Petitfrere before tagging them.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "DJ SNAKE, CAIRO EXPRESS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150744
  },
  {
    "id": "1786574150701-eycnp",
    "text": "Publish the caption with confirmed tags: djsnake, chndy underscore, birth underscore productions, 2horlogesproduction.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "DJ SNAKE, CAIRO EXPRESS",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150745
  },
  {
    "id": "1786574150701-3trhs",
    "text": "Get Chef Joe's current restaurant name and location from Daniel before using the project as a live case study anywhere. The historical Nekkei, Surry Hills reference is accurate and sufficient for the origin story video as is.",
    "category": "CONTENT PRODUCTION (INSTAGRAM / REELS)",
    "subcategory": "CHEF JOE",
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150746
  },
  {
    "id": "1786574150701-o2hk4",
    "text": "Decide the Release Plan real numbers: how many cutdowns per release, how long the post release window runs, and whether the content day is a half day or a full day.",
    "category": "STRATEGY / BUSINESS DECISIONS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150747
  },
  {
    "id": "1786574150701-tey33",
    "text": "Decide the Release Plan photography bundling approach. Proposed as a separate named add on rather than folded into the core package, confirm or adjust.",
    "category": "STRATEGY / BUSINESS DECISIONS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150748
  },
  {
    "id": "1786574150701-ny9sn",
    "text": "Once numbers are confirmed, turn the Release Plan into a one page offer document.",
    "category": "STRATEGY / BUSINESS DECISIONS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150749
  },
  {
    "id": "1786574150701-8a440",
    "text": "Hold off selling audience growth guidance as part of the Release Plan offer. Prove the funnel system on 618 Media's own account first, then use that as real evidence.",
    "category": "STRATEGY / BUSINESS DECISIONS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150750
  },
  {
    "id": "1786574150701-bqm0n",
    "text": "Set a 6 month check-in point to see if the artist/music video focus is actually growing revenue, not just inquiries.",
    "category": "STRATEGY / BUSINESS DECISIONS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150751
  },
  {
    "id": "1786574150701-0kmyf",
    "text": "Decide whether growing artist volume should also mean gradually raising the price floor over time, or staying at $3,000 to $4,000.",
    "category": "STRATEGY / BUSINESS DECISIONS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150752
  },
  {
    "id": "1786574150701-3zi2z",
    "text": "Find out whether 618 Media currently has any recurring or retainer client relationships, or whether all current work is project based. Asked directly, not yet answered.",
    "category": "STRATEGY / BUSINESS DECISIONS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150753
  },
  {
    "id": "1786574150701-02mei",
    "text": "Correct the carousel skill file: it still lists #E04212 as the primary orange and explicitly says never use #E5421A, which is now backwards. It also specifies Archivo Black and Barlow instead of DM Serif Display and DM Sans. Decide whether the carousel system is meant to be visually distinct from the website on purpose, or should be realigned to match confirmed brand values.",
    "category": "STANDING RULES / SYSTEMS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150754
  },
  {
    "id": "1786574150701-xfpag",
    "text": "Decide which caption style is the default going forward: the funnel structure (pain point, solution, signature) versus the shorter Eyecandy style, and for which content type (brand breakdown reels versus your own reaction content).",
    "category": "STANDING RULES / SYSTEMS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150755
  },
  {
    "id": "1786574150701-v6ixt",
    "text": "Run a final proofread pass for em dashes across everything already shipped. Corrected multiple times already, worth one clean sweep.",
    "category": "STANDING RULES / SYSTEMS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150756
  },
  {
    "id": "1786574150701-9gy33",
    "text": "If not already installed, save the 618-funnel-content skill to the profile so future requests in this project use it automatically.",
    "category": "STANDING RULES / SYSTEMS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150757
  },
  {
    "id": "1786574150701-apfuh",
    "text": "Keep the 618-funnel-content skill updated as facts change (view count, brand colour, Danny's answers once they come in), or it will hand out stale facts.",
    "category": "STANDING RULES / SYSTEMS",
    "subcategory": null,
    "assignee": "Unassigned",
    "status": "open",
    "notes": "",
    "createdAt": 1786574150758
  },
  {
    "id": "1786574150701-fld38",
    "text": "Removed all Central Coast, Erina, Gosford, Narara, Tuggerah, and Terrigal references from location suggestions",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150759
  },
  {
    "id": "1786574150701-ibgve",
    "text": "Fixed the dead end bug where a custom \"something else\" answer never unlocked the Next button",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150760
  },
  {
    "id": "1786574150701-d2qtv",
    "text": "Converted the calculator into a proper Squarespace fragment, scoped under .aw, no DOCTYPE/html/head/body",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150761
  },
  {
    "id": "1786574150701-2c6z2",
    "text": "Fixed brand colours to #E5421A and fonts to DM Serif Display / DM Sans (was running on the old #E04212 and Barlow)",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150762
  },
  {
    "id": "1786574150701-t3u0n",
    "text": "Fixed a self-XSS hole on the confirmation screen (name/email were going into innerHTML unescaped)",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150763
  },
  {
    "id": "1786574150701-0ht9p",
    "text": "Fixed dollar formatting to use en-AU locale explicitly",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150764
  },
  {
    "id": "1786574150701-nkt4s",
    "text": "Removed the Promo and \"Something Else\" categories entirely",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150765
  },
  {
    "id": "1786574150701-44jki",
    "text": "Estimate now shows as a range, not a single number (tier base to +35 percent)",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150766
  },
  {
    "id": "1786574150701-0wn02",
    "text": "Vehicle rigging, multiple locations, and green screen/VFX now force the 30 minute project call regardless of price",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150767
  },
  {
    "id": "1786574150701-x8lsa",
    "text": "Location and vibe/tone questions can no longer be skipped",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150768
  },
  {
    "id": "1786574150701-kav1a",
    "text": "Added a multi-day slider (1 to 5+ days) and an on-camera headcount slider",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150769
  },
  {
    "id": "1786574150701-sqxtn",
    "text": "Fixed the core pricing bug: every complexity answer now actually affects the estimate shown, regardless of which price tier gets clicked. This was the root cause of the Gerry Byrne underquote and the \"pages weren't connected\" bug flagged separately",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150770
  },
  {
    "id": "1786574150701-neamr",
    "text": "Added a 15 percent rush surcharge with a plain on-screen note the moment a rush qualifying timeline is picked",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150771
  },
  {
    "id": "1786574150701-gb3ob",
    "text": "Added a note on the results screen telling clients the number reflects everything selected and pointing them to the form or a call",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150772
  },
  {
    "id": "1786574150701-nzsky",
    "text": "Decided out of scope for the calculator: hired actors/extras, venue permits (handled directly per client), music licensing (already included in standard scope)",
    "category": "DONE",
    "subcategory": "CALCULATOR FIXES",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150773
  },
  {
    "id": "1786574150701-lzc6k",
    "text": "Root cause of the broken $2,000 to $2,700 estimate found and fixed in the calculator",
    "category": "DONE",
    "subcategory": "GERRY BYRNE / SYDNEY MALE CHOIR (PROGRESS SO FAR)",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150774
  },
  {
    "id": "1786574150701-fh10s",
    "text": "Outreach sent: call attempted, follow up text sent, two follow up emails sent",
    "category": "DONE",
    "subcategory": "GERRY BYRNE / SYDNEY MALE CHOIR (PROGRESS SO FAR)",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150775
  },
  {
    "id": "1786574150701-o0jch",
    "text": "Full production brief and creative storyboard received and reviewed",
    "category": "DONE",
    "subcategory": "GERRY BYRNE / SYDNEY MALE CHOIR (PROGRESS SO FAR)",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150776
  },
  {
    "id": "1786574150702-lqllc",
    "text": "Estimate calculated against the actual brief: $9,100 to $12,300",
    "category": "DONE",
    "subcategory": "GERRY BYRNE / SYDNEY MALE CHOIR (PROGRESS SO FAR)",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150777
  },
  {
    "id": "1786574150702-eqkj6",
    "text": "Built and packaged the 618-tool-building skill (verify_tool.py and verify_logic.js), proven against real regressions including a reconstruction of the exact Gerry Byrne bug",
    "category": "DONE",
    "subcategory": "TOOLS AND SPREADSHEETS",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150778
  },
  {
    "id": "1786574150702-cd99h",
    "text": "Built 618_pricing_review.xlsx for Amro and Danny to review together, all tiers, add ons, and pricing logic with live formulas",
    "category": "DONE",
    "subcategory": "TOOLS AND SPREADSHEETS",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150779
  },
  {
    "id": "1786574150702-o4m32",
    "text": "Reviewed with Danny, Gym tier raised to 1200/1700/2500, applied back into the calculator and reverified",
    "category": "DONE",
    "subcategory": "TOOLS AND SPREADSHEETS",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150780
  },
  {
    "id": "1786574150702-obfut",
    "text": "Specialisation decided: 618's identity now centers on music video, specifically independent/emerging artists, using the funnel already built (Instagram content, DM templates, reaction videos)",
    "category": "DONE",
    "subcategory": "STRATEGY",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150781
  },
  {
    "id": "1786574150702-vvm3i",
    "text": "Decided to keep Gym, Corporate, Real Estate, and Social live on the calculator and in SEO content, not the focus but not cut either",
    "category": "DONE",
    "subcategory": "STRATEGY",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150782
  },
  {
    "id": "1786574150702-r8l7u",
    "text": "The 618 Session concept decided: fixed format built around the 5 existing music_style options; up to 2 locations equals 1 shoot day included, 3 to 4+ locations means a second shoot day at +$900",
    "category": "DONE",
    "subcategory": "STRATEGY",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150783
  },
  {
    "id": "1786574150702-zcfnj",
    "text": "Amro's origin story beat sheet and 20 question interview PDF completed (this was the gate on the Whole Night view count fix, now cleared)",
    "category": "DONE",
    "subcategory": "CONTENT / WORKFLOW",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150784
  },
  {
    "id": "1786574150702-2d2bd",
    "text": "Standing rule confirmed: Claude responses for this project come back in caption format unless told otherwise",
    "category": "DONE",
    "subcategory": "CONTENT / WORKFLOW",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150785
  },
  {
    "id": "1786574150702-nl102",
    "text": "Decided: opening line for Amro's origin story video is his own stated line, hook intentionally skipped as an exception, not an oversight",
    "category": "DONE",
    "subcategory": "CONTENT / WORKFLOW",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150786
  },
  {
    "id": "1786574150702-nnowa",
    "text": "Decided: the PR and immigration story stays out of the origin story video on purpose, to be developed as its own separate video later",
    "category": "DONE",
    "subcategory": "CONTENT / WORKFLOW",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150787
  },
  {
    "id": "1786574150702-m52co",
    "text": "Standing rules confirmed and in effect: every caption defaults to pain point first then 618 Media's approach as the solution then signature and hashtags; every script or Reel opens with one of the 10 approved hooks unless an explicit personal opening line is given; personal or testimonial scripts are built as beat sheets and filmed as interviews, not word for word scripts",
    "category": "DONE",
    "subcategory": "CONTENT / WORKFLOW",
    "assignee": "Unassigned",
    "status": "done",
    "notes": "",
    "createdAt": 1786574150788
  }
];

// ---------- State ----------

const state = {
  tasks: [],
  filter: { query: '', category: 'All', assignee: 'All', showDone: false },
  editingId: null,
  categoryManuallySet: false,
};

// ---------- Utilities ----------

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function canonicalName(term) {
  const t = (term || '').toLowerCase().trim();
  return NAME_ALIASES[t] || t;
}

function assigneeSlug(assignee) {
  return (assignee || 'unassigned').toLowerCase();
}

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

// ---------- Persistence ----------

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read saved tasks, starting fresh.', e);
  }
  const seeded = DEFAULT_TASKS.map(t => ({ ...t }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

// ---------- Category guessing ----------

function guessCategory(text) {
  const t = (text || '').toLowerCase();
  let best = null, bestScore = 0;
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const w of words) if (t.includes(w)) score++;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best;
}

// ---------- Search ----------

function matchesSearch(task, rawQuery) {
  if (!rawQuery) return true;
  const q = rawQuery.toLowerCase().trim();
  if (!q) return true;
  const canonQ = canonicalName(q);

  const haystack = [task.text, task.notes || '', task.category || '', task.subcategory || '']
    .join(' ').toLowerCase();
  if (haystack.includes(q)) return true;

  const assignee = (task.assignee || '').toLowerCase();
  if (assignee.includes(q)) return true;
  if (canonicalName(assignee) === canonQ) return true;

  return false;
}

// ---------- Import parser (mirrors parse_seed.py) ----------

function parseImportText(raw) {
  const lines = raw.split(/\r?\n/);
  const dividerRe = /^=+$/;
  const taskRe = /^\[( |x|X)\]\s+(.*)$/;
  const tasks = [];
  let currentCategory = null;
  let currentSub = null;
  let waitingForHeader = false;
  let skipNextDivider = false;
  let order = 0;
  const base = Date.now();

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (dividerRe.test(line)) {
      if (skipNextDivider) skipNextDivider = false;
      else waitingForHeader = true;
      continue;
    }
    if (line === '') continue;

    if (waitingForHeader) {
      currentCategory = line;
      currentSub = null;
      waitingForHeader = false;
      skipNextDivider = true;
      continue;
    }

    const m = line.match(taskRe);
    if (m) {
      const status = m[1].toLowerCase() === 'x' ? 'done' : 'open';
      const text = m[2].trim();
      tasks.push({
        id: uid(),
        text,
        category: currentCategory || 'Uncategorized',
        subcategory: currentSub,
        assignee: 'Unassigned',
        status,
        notes: '',
        createdAt: base + (order++),
      });
      continue;
    }

    if (currentCategory && line === line.toUpperCase() && /[A-Za-z]/.test(line)) {
      currentSub = line;
      continue;
    }
  }
  return tasks;
}

function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseImportText(String(reader.result));
    if (!parsed.length) {
      showToast('No [ ] or [x] items found in that file.');
      return;
    }
    const existingTextSet = new Set(state.tasks.map(t => t.text.trim().toLowerCase()));
    let added = 0, skipped = 0;
    for (const t of parsed) {
      const key = t.text.trim().toLowerCase();
      if (existingTextSet.has(key)) { skipped++; continue; }
      existingTextSet.add(key);
      state.tasks.push(t);
      added++;
    }
    saveTasks();
    render();
    showToast(`Imported ${added} task${added === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}` : ''}.`);
  };
  reader.onerror = () => showToast('Could not read that file.');
  reader.readAsText(file);
}

// ---------- Export ----------

function exportTasks() {
  const extraCats = [...new Set(state.tasks.map(t => t.category))].filter(c => !CATEGORIES.includes(c));
  const orderedCats = [...CATEGORIES, ...extraCats];
  const divider = '='.repeat(54);

  let out = '618 MEDIA MASTER ACTION PLAN\n';
  out += `Exported from the Action Plan app on ${new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })}\n\n`;

  for (const cat of orderedCats) {
    const items = state.tasks.filter(t => t.category === cat);
    if (!items.length) continue;

    out += `${divider}\n${cat}\n${divider}\n\n`;

    const sorted = [...items].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    let lastSub;
    for (const t of sorted) {
      if (t.subcategory !== lastSub) {
        if (t.subcategory) out += `${t.subcategory}\n\n`;
        lastSub = t.subcategory;
      }
      const box = t.status === 'done' ? '[x]' : '[ ]';
      const assigneeTag = t.assignee && t.assignee !== 'Unassigned' ? ` (Assigned: ${t.assignee})` : '';
      out += `${box} ${t.text}${assigneeTag}\n`;
      if (t.notes) out += `    Note: ${t.notes}\n`;
      out += '\n';
    }
  }

  const blob = new Blob([out], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `618-media-action-plan-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported.');
}

// ---------- Rendering ----------

function getFilteredGrouped() {
  const { query, category, assignee, showDone } = state.filter;
  const searching = query.trim().length > 0;

  let tasks = state.tasks.filter(t => {
    if (!matchesSearch(t, query)) return false;
    if (category !== 'All' && t.category !== category) return false;
    if (assignee !== 'All' && (t.assignee || 'Unassigned') !== assignee) return false;
    if (!searching && !showDone && t.status === 'done' && category !== 'DONE') return false;
    return true;
  });

  const allCats = [...new Set([...CATEGORIES, ...tasks.map(t => t.category)])];
  const grouped = [];
  for (const cat of allCats) {
    const items = tasks.filter(t => t.category === cat);
    if (!items.length) continue;
    items.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
    grouped.push({ category: cat, items });
  }
  return grouped;
}

function render() {
  const list = document.getElementById('list');
  const empty = document.getElementById('emptyState');
  const grouped = getFilteredGrouped();

  if (!grouped.length) {
    list.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  let html = '';
  grouped.forEach(group => {
    const idx = CATEGORIES.indexOf(group.category);
    const numStr = idx >= 0 ? String(idx + 1).padStart(2, '0') : '--';
    const isUrgent = group.category === 'URGENT / BUGS';
    const openCount = group.items.filter(t => t.status !== 'done').length;

    html += `<section class="cat-section">
      <div class="cat-header">
        <span class="cat-num${isUrgent ? ' is-urgent' : ''}">${numStr}</span>
        <h2 class="cat-title">${escapeHtml(group.category)}</h2>
        <span class="cat-count">${openCount} open</span>
      </div>
      <div class="cat-tasks">`;

    let lastSub;
    group.items.forEach(t => {
      if (t.subcategory && t.subcategory !== lastSub) {
        html += `<p class="cat-sub">${escapeHtml(t.subcategory)}</p>`;
      }
      lastSub = t.subcategory;

      const done = t.status === 'done';
      html += `<div class="task-card${done ? ' is-done' : ''}${isUrgent ? ' is-urgent-cat' : ''}" data-id="${t.id}">
        <button class="task-check" data-action="toggle" data-id="${t.id}" aria-label="${done ? 'Mark open' : 'Mark done'}">
          ${done ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.2L4.8 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
        </button>
        <div class="task-body" data-action="edit" data-id="${t.id}">
          <p class="task-text">${escapeHtml(t.text)}</p>
          ${t.notes ? `<p class="task-notes">${escapeHtml(t.notes)}</p>` : ''}
          <div class="task-meta">
            <span class="badge assignee-${assigneeSlug(t.assignee)}">${escapeHtml(t.assignee || 'Unassigned')}</span>
          </div>
        </div>
      </div>`;
    });

    html += `</div></section>`;
  });

  list.innerHTML = html;
}

function renderChips() {
  const assigneeChips = document.getElementById('assigneeChips');
  const categoryChips = document.getElementById('categoryChips');

  const assigneeOptions = ['All', ...ASSIGNEES];
  assigneeChips.innerHTML = assigneeOptions.map(a =>
    `<button class="chip${state.filter.assignee === a ? ' is-active' : ''}" data-filter="assignee" data-value="${escapeHtml(a)}">${escapeHtml(a)}</button>`
  ).join('');

  const categoryOptions = ['All', ...new Set([...CATEGORIES, ...state.tasks.map(t => t.category)])];
  categoryChips.innerHTML = categoryOptions.map(c => {
    const active = state.filter.category === c;
    const urgent = c === 'URGENT / BUGS';
    return `<button class="chip${active ? ' is-active' : ''}${active && urgent ? ' is-urgent' : ''}" data-filter="category" data-value="${escapeHtml(c)}">${escapeHtml(c === 'All' ? 'All' : c)}</button>`;
  }).join('');
}

// ---------- Modal ----------

function populateSelects() {
  const catSel = document.getElementById('taskCategory');
  catSel.innerHTML = CATEGORIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')
    + `<option value="Uncategorized">Uncategorized</option>`
    + `<option value="__new__">+ New category...</option>`;

  const assSel = document.getElementById('taskAssignee');
  assSel.innerHTML = ASSIGNEES.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
}

function openModal(task) {
  state.editingId = task ? task.id : null;
  state.categoryManuallySet = !!task;

  document.getElementById('modalTitle').textContent = task ? 'Edit task' : 'Add task';
  document.getElementById('taskText').value = task ? task.text : '';
  document.getElementById('taskNotes').value = task ? (task.notes || '') : '';
  document.getElementById('taskCategoryCustom').hidden = true;
  document.getElementById('taskCategoryCustom').value = '';
  document.getElementById('suggestHint').hidden = true;

  const catSel = document.getElementById('taskCategory');
  if (task) {
    if (CATEGORIES.includes(task.category) || task.category === 'Uncategorized') {
      catSel.value = task.category;
    } else {
      catSel.value = '__new__';
      document.getElementById('taskCategoryCustom').hidden = false;
      document.getElementById('taskCategoryCustom').value = task.category;
    }
  } else {
    catSel.value = 'Uncategorized';
  }

  document.getElementById('taskAssignee').value = task ? (task.assignee || 'Unassigned') : 'Unassigned';
  document.getElementById('deleteTaskBtn').hidden = !task;

  const backdrop = document.getElementById('modalBackdrop');
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.removeAttribute('data-closing'));
  document.getElementById('taskText').focus();
}

function closeModal() {
  const backdrop = document.getElementById('modalBackdrop');
  backdrop.setAttribute('data-closing', '');
  setTimeout(() => { backdrop.hidden = true; }, 200);
  state.editingId = null;
}

function onTaskTextInput() {
  if (state.categoryManuallySet) return;
  const text = document.getElementById('taskText').value;
  const guess = guessCategory(text);
  const hint = document.getElementById('suggestHint');
  if (guess) {
    document.getElementById('taskCategory').value = guess;
    hint.textContent = `Auto-detected: ${guess}`;
    hint.hidden = false;
  } else {
    hint.hidden = true;
  }
}

function saveTaskFromModal() {
  const text = document.getElementById('taskText').value.trim();
  if (!text) { showToast('Add some text first.'); return; }

  let category = document.getElementById('taskCategory').value;
  if (category === '__new__') {
    const custom = document.getElementById('taskCategoryCustom').value.trim();
    category = custom || 'Uncategorized';
  }
  const assignee = document.getElementById('taskAssignee').value;
  const notes = document.getElementById('taskNotes').value.trim();

  if (state.editingId) {
    const t = state.tasks.find(x => x.id === state.editingId);
    if (t) {
      t.text = text;
      t.category = category;
      t.assignee = assignee;
      t.notes = notes;
    }
  } else {
    state.tasks.push({
      id: uid(),
      text,
      category,
      subcategory: null,
      assignee,
      status: 'open',
      notes,
      createdAt: Date.now(),
    });
  }

  saveTasks();
  renderChips();
  render();
  closeModal();
}

function deleteTask() {
  if (!state.editingId) return;
  if (!confirm('Delete this task?')) return;
  state.tasks = state.tasks.filter(t => t.id !== state.editingId);
  saveTasks();
  renderChips();
  render();
  closeModal();
}

function toggleTaskStatus(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  t.status = t.status === 'done' ? 'open' : 'done';
  saveTasks();
  render();
}

// ---------- Event wiring ----------

function bindEvents() {
  document.getElementById('searchInput').addEventListener('input', e => {
    state.filter.query = e.target.value;
    document.getElementById('clearSearch').hidden = !e.target.value;
    render();
  });
  document.getElementById('clearSearch').addEventListener('click', () => {
    const input = document.getElementById('searchInput');
    input.value = '';
    state.filter.query = '';
    document.getElementById('clearSearch').hidden = true;
    render();
  });

  document.getElementById('assigneeChips').addEventListener('click', e => {
    const btn = e.target.closest('[data-filter="assignee"]');
    if (!btn) return;
    state.filter.assignee = btn.dataset.value;
    renderChips();
    render();
  });
  document.getElementById('categoryChips').addEventListener('click', e => {
    const btn = e.target.closest('[data-filter="category"]');
    if (!btn) return;
    state.filter.category = btn.dataset.value;
    renderChips();
    render();
  });

  document.getElementById('showDoneToggle').addEventListener('change', e => {
    state.filter.showDone = e.target.checked;
    render();
  });

  document.getElementById('list').addEventListener('click', e => {
    const toggleBtn = e.target.closest('[data-action="toggle"]');
    if (toggleBtn) { toggleTaskStatus(toggleBtn.dataset.id); return; }
    const editArea = e.target.closest('[data-action="edit"]');
    if (editArea) {
      const t = state.tasks.find(x => x.id === editArea.dataset.id);
      if (t) openModal(t);
    }
  });

  document.getElementById('fab').addEventListener('click', () => openModal(null));
  document.getElementById('cancelTaskBtn').addEventListener('click', closeModal);
  document.getElementById('saveTaskBtn').addEventListener('click', saveTaskFromModal);
  document.getElementById('deleteTaskBtn').addEventListener('click', deleteTask);
  document.getElementById('modalBackdrop').addEventListener('click', e => {
    if (e.target.id === 'modalBackdrop') closeModal();
  });

  document.getElementById('taskText').addEventListener('input', onTaskTextInput);
  document.getElementById('taskCategory').addEventListener('change', e => {
    state.categoryManuallySet = true;
    document.getElementById('taskCategoryCustom').hidden = e.target.value !== '__new__';
    document.getElementById('suggestHint').hidden = true;
  });

  const menuBtn = document.getElementById('menuBtn');
  const menuPanel = document.getElementById('menuPanel');
  menuBtn.addEventListener('click', () => {
    const open = menuPanel.hidden;
    menuPanel.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!menuPanel.hidden && !menuPanel.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
      menuPanel.hidden = true;
    }
  });
  menuPanel.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    menuPanel.hidden = true;
    if (btn.dataset.action === 'import') document.getElementById('importFile').click();
    if (btn.dataset.action === 'export') exportTasks();
    if (btn.dataset.action === 'reset') {
      if (confirm('This clears every task and note in this browser and reloads the original 13 Aug plan. Continue?')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    }
  });

  document.getElementById('importFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleImportFile(file);
    e.target.value = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modalBackdrop').hidden) closeModal();
  });
}

// ---------- Gate ----------

function initGate() {
  if (!GATE_ENABLED || localStorage.getItem('gate-ok') === '1') {
    document.getElementById('gate').hidden = true;
    startApp();
    return;
  }
  const gate = document.getElementById('gate');
  gate.hidden = false;
  document.getElementById('gateForm').addEventListener('submit', async e => {
    e.preventDefault();
    const val = document.getElementById('gateInput').value;
    const hash = await sha256Hex(val);
    if (hash === GATE_HASH) {
      localStorage.setItem('gate-ok', '1');
      gate.hidden = true;
      startApp();
    } else {
      const card = document.querySelector('.gate-card');
      document.getElementById('gateError').hidden = false;
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
  });
}

// ---------- Boot ----------

function startApp() {
  state.tasks = loadTasks();
  populateSelects();
  bindEvents();
  renderChips();
  render();
  document.getElementById('app').hidden = false;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

initGate();
