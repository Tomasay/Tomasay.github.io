---
name: update-resume
description: Publish a new version of ThomasRatliffResume.pdf on dev-tom.com — bump the ?v= cache-busting version everywhere it appears, then commit and push. Use when the user says they updated, replaced, or swapped in a new resume, or asks to bump/refresh the resume link.
---

# Updating the resume

`ThomasRatliffResume.pdf` sits at the repo root and is handed out as the stable link
`https://dev-tom.com/resume` (served by `resume.html`, which redirects to the PDF).

**The version query string is the entire cache-busting mechanism.** GitHub Pages
doesn't allow custom `Cache-Control` headers, and mobile browsers hand PDFs to a
separate viewer (iOS QuickLook, Chrome's PDF viewer, in-app webviews) whose cache
survives "clear browsing data". Replacing the PDF without bumping `?v=` means someone
opening the link on a phone can get a months-old file with no way to know. Never skip
the bump.

## Steps

1. **Confirm the PDF actually changed** — `git status --short ThomasRatliffResume.pdf`.
   If it isn't modified, stop and tell the user; nothing to publish.

2. **Find every occurrence** so a new one is never missed:

   ```bash
   grep -rn "ThomasRatliffResume.pdf?v=" --include=*.html --include=*.js .
   ```

   As of the last update that's three places, but trust the grep over this list:
   - `index.html` — the nav "Resume" link
   - `resume.html` — the `<meta http-equiv="refresh">` target
   - `resume.html` — the `#resume-link` anchor the inline script reads

3. **Pick the new version.** Format is `YYYYMMDD`, with a lowercase letter suffix for
   a second-or-later update on the same day (`20260814` → `20260814b` → `20260814c`).
   Use today's date; check the current value first so a same-day re-publish suffixes
   rather than collides.

4. **Replace all of them in one pass**, then re-grep to confirm none survive:

   ```bash
   sed -i 's/ThomasRatliffResume\.pdf?v=OLD/ThomasRatliffResume.pdf?v=NEW/g' index.html resume.html
   ```

5. **Commit and push** to `master` (this repo's default branch — GitHub Pages serves
   from it, so a push is a deploy). Stage the PDF *and* the touched HTML together;
   a commit with one but not the other is the failure mode this skill exists to
   prevent. Message follows the existing history:

   ```
   Update the resume and bump its version to NEW
   ```

## Don't

- Don't add a redirect hop or rename `resume.html` — `/resume` works because GitHub
  Pages serves extensionless paths, and the URL is printed on applications.
- Don't hardcode the version in a second spot in `resume.html`; the inline script
  deliberately reads it back off `#resume-link` so that page has one source of truth.
