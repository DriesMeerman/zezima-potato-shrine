# Zezima's Potato Patch

A small, unofficial RuneScape fan shrine with original pixel art, parchment panels, a potato harvest game, and a personal guestbook. The potato lore and decorative hit counter are fictional. Zezima is described as a real player without claims about a current rank.

Repository: [DriesMeerman/zezima-potato-shrine](https://github.com/DriesMeerman/zezima-potato-shrine).

## Run

No dependencies or build step are needed. From the repository root:

```sh
python3 -m http.server 8000 --directory docs
```

Open `http://localhost:8000`. Use an HTTP server rather than opening the HTML file directly because the JavaScript uses native ES modules. `npm start` runs the same server command if Node and Python are installed.

## Test

```sh
npm test
```

Node's built-in test runner checks persistence round trips, storage failures, corrupt data, harvest bounds, guestbook input limits, blank submissions, and retaining the latest 12 entries. No install is required.

For browser verification, harvest all six potatoes, plant another row, add a guestbook note, and reload. The count and note should remain. Markup typed into the guestbook must display as literal text. Check a narrow mobile viewport and keyboard navigation. With local storage blocked, the game and guestbook continue in memory and explain that data lasts for the current visit.

## Files and behavior

- `docs/index.html`: content, navigation, accessible forms, and source links.
- `docs/styles.css`: responsive retro layout and reduced-motion support.
- `docs/app.js`: DOM interaction. Guestbook input is inserted using `textContent`.
- `docs/state.js`: storage handling and validated, bounded state.
- `docs/assets/`: original SVG potato and pixel art adventurer scene.
- `tests/state.test.js`: data and persistence tests.

The guestbook is local to the visitor's browser, not a public message board. Harvest totals use the same origin's local storage. Each fresh visit or planted row provides six potatoes. Guestbook notes are limited to 24 characters for the name and 240 for the message. No analytics, accounts, external fonts, or external libraries are used. The source links open the RuneScape Wiki.

RuneScape is a trademark of Jagex Ltd. This fan site is not affiliated with Zezima or Jagex.

## GitHub Pages

GitHub Pages publishes `docs/` from the default branch. The `.nojekyll` file tells Pages to serve these static files directly. All assets use relative URLs so the site works under its repository path.

Site URL: [driesmeerman.github.io/zezima-potato-shrine](https://driesmeerman.github.io/zezima-potato-shrine/).

To publish future changes, review the pull request and merge it into `main`. GitHub Pages then rebuilds the site. In repository Settings, Pages should use Deploy from a branch, with `main` and `/docs` as its source.

The site uses GitHub's built-in branch publishing. `examples/pages-workflow.yml` is an optional manual Actions workflow. To use it, copy it to `.github/workflows/pages.yml` and change the Pages publishing source to GitHub Actions. Uploading that workflow requires workflow write access. The example does not run as stored here.

See [GitHub's publishing source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
