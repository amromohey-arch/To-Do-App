# 618 Media Action Plan

A small, no-backend task tracker for 618 Media, built to run entirely as static files on GitHub Pages. No account system, no server, no monthly cost.

## What it actually does

- Loads your 13 Aug 2026 master action plan pre-populated (89 tasks, already categorised).
- Add, edit, delete, and mark tasks done.
- Assign each task to Amro, Daniel, Both, or leave Unassigned.
- Quick-add box guesses the category from what you type (keyword matching, not real AI, see below) and you can override it before saving.
- Search box matches task text, notes, and assignee. Searching "danny" or "daniel" both match tasks assigned to Daniel.
- Import: upload a `.txt` file in the same format as this plan (`[ ] item`, `[x] done item`, grouped under `====` category headers) and it merges new items in, skipping exact duplicates.
- Export: downloads your current list back into that same `.txt` format, so you can paste it into a Claude chat and keep going from there.
- Works offline once loaded once (basic service worker caching).
- Installable to your phone home screen (Add to Home Screen / Install app) so it opens like a normal app.

## What it deliberately does not do

I did not build this out to a full Asana-style tool (dependencies, Gantt charts, automations, time tracking, multi-workspace, resource heatmaps, real-time collaboration). For two people tracking a shared list, that's a lot of surface area for very little daily value, and it's the exact trap the "core vs differentiator" framework you pasted was warning against. If any of that turns out to be a real gap once you're using this day to day, tell me and I'll add just that piece.

## Important limitation: no cross-device sync

This app stores everything in your browser's local storage. There is no database. That means:

- Tasks you add on your phone stay on your phone (in that one browser).
- If you also open this on a laptop, it will start from the same pre-loaded 89 tasks but will **not** see anything you added on your phone, and vice versa.
- Use **Export** to grab a snapshot from one device and **Import** it on another if you need to move data across.

If you end up wanting real sync (phone and desktop always showing the same list), that needs a small free backend added (Firebase or Supabase both have generous free tiers and work fine with a static frontend like this one). That's a follow-up, not something I've built here, flagging it now so it's a decision rather than a surprise.

## Important limitation: this site is public

GitHub Pages sites are public by default. Even if your source repository is private, the *published site* is visible to anyone who has the URL unless you're on GitHub Enterprise Cloud with Pages access control enabled, which a personal account isn't. Given this contains real client names, quotes, and pricing, I added two lightweight deterrents:

1. `robots.txt` and a `noindex` meta tag, so it won't turn up in Google.
2. A passphrase lock screen on load.

**Neither of these is real security.** The passphrase check runs in your browser and anyone who opens dev tools can read the source. It stops a random person who stumbles on the link, not a determined one. Two things to do before you push this repo:

1. Change the passphrase. Open your browser console on any page and run:
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-new-passphrase'))
     .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')))
   ```
   Copy the printed hash into `GATE_HASH` near the top of `app.js`. The current placeholder passphrase is `changeme618`, change it.
2. If the client data in here is sensitive enough that "public URL, not indexed, passphrase-gated" isn't good enough for you, don't use GitHub Pages for this. Say so and I'll point you to Cloudflare Pages with Cloudflare Access instead, which gives you real email-based login for free.

## Deploying to GitHub Pages

1. Create a new **private or public** GitHub repository (private is fine, the published site is public either way, see above).
2. Add all the files in this folder to the repo root: `index.html`, `style.css`, `app.js`, `manifest.json`, `icon.svg`, `sw.js`, `robots.txt`.
3. Push to the `main` branch.
4. In the repo, go to **Settings → Pages**.
5. Under **Build and deployment → Source**, choose **Deploy from a branch**.
6. Branch: `main`, folder: `/ (root)`. Save.
7. Wait a minute, then your app is live at `https://<your-username>.github.io/<repo-name>/`.
8. On your phone, open that URL in Safari or Chrome, then use **Add to Home Screen** (Safari: Share → Add to Home Screen; Chrome: menu → Add to Home screen / Install app).

## Updating the plan from a new Claude session

When you paste a fresh action-plan `.txt` from Claude, use the in-app **Import** (menu icon top right) rather than replacing files. It merges in, it doesn't wipe what you've already ticked off or reassigned. If you want a completely clean slate instead, use **Reset all data** in the same menu, that reloads the original 13 Aug seed.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | All styling, using 618's brand tokens (`#E5421A` orange, DM Serif Display / DM Sans) |
| `app.js` | All logic: state, rendering, search, categorisation, import/export, the passphrase gate |
| `manifest.json`, `icon.svg` | Home screen install support |
| `sw.js` | Offline caching |
| `robots.txt` | Blocks search engine indexing |

## How the auto-categorisation actually works

It's keyword matching, not AI. `app.js` has a `CATEGORY_KEYWORDS` object mapping words like "gerry", "calculator", "instagram" to categories. When you type a note, it scores each category by how many of its keywords appear in your text and picks the highest score. It's right most of the time for this kind of content because the categories are already fairly distinct in vocabulary, but it will get ambiguous notes wrong, that's why the category is always shown and editable before you save, not applied silently.
