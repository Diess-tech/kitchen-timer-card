# Kitchen Timer Card — notes for Claude

- Single-file vanilla JS custom card (`kitchen-timer-card.js`), no build step, no dependencies. Shadow DOM, re-renders only when the timer/name states change; a 1 s interval updates the countdown text.
- Timers are HA `timer.*` helpers. Optional `name_entity` (`input_text.*`) per timer holds what is cooking; without it the name goes to localStorage.
- +1/−1 uses `timer.start` with the new remaining duration (HA `timer.change` refuses to exceed the original duration).
- Finish detection: active → idle transition near `finishes_at` (in `_detectFinished`), plus the countdown reaching 0 in `_tick`. The last known name is kept because automations often clear the name helper at finish.
- Built-in presets and UI strings live in `KTC_I18N` (en, it).
- Preset groups: `items` always shown, `more` shown after the group's *more* toggle (`this._open`). A group with `type: "steak"` renders the beef steak row: thickness input + rare/medium/well buttons, minutes per side from `KTC_STEAK` (interpolated, half minutes); one timer of 2 x side, name says when to flip (countdown shows the side time = half). Beef only on purpose (food safety): no rare for pork, chicken or minced meat. Steak times are indicative; change them only with a source.
- Keep `hacs.json` filename in sync with the JS file name. Bump `KTC_VERSION` and create a GitHub release for every version.
- The author (Davide) is Italian and a hobbyist: explain things to him in simple Italian.
- In Davide's Home Assistant the original version lives on the "plancia-frigo" dashboard (#timer popup) with timer.timer_cucina_1..3 and input_text.nome_timer_cucina_1..3; voice alert by automation.timer_cucina_avviso_fine_tempo_sul_tablet.

## Releasing
- Bump `KTC_VERSION` in the JS, commit, tag `vX.Y.Z`, create a GitHub release (HACS reads releases). Owner creates the release by hand (Claude cannot create tags).
- On every published release a workflow (`.github/workflows/allega-alla-release.yml`) attaches `kitchen-timer-card.js` to it, so HACS downloads count. It can also be run by hand for an existing tag (Actions > Run workflow). If it fails on permissions: Settings > Actions > General > Workflow permissions > Read and write.
- There is no HACS validation workflow (removed on purpose, to match the outlet card). To run the official check by hand, add `hacs/action@main` with `category: plugin` and set description and topics on GitHub first.
- README preview (`preview.png`) is in English, made from the real card with example data (not from the owner's HA). HACS shows the README of the release, so a README change needs a new release.

## Commits
- Claude is shown as a contributor (owner's choice, 17 Nov 2026). Commit with the owner's identity (`Davide Sanna <Diess-tech@users.noreply.github.com>`) and end every commit message with this line:
  `Co-Authored-By: Claude <noreply@anthropic.com>`
  Do NOT add the `Claude-Session` link: this repo is public and the link is useless to others.
- The first commit (v0.1.0) has a different trailer and a session link; it is not rewritten.
- Donation links: PayPal `paypal.me/diesstech`, Ko-fi `ko-fi.com/diesstech`, Buy Me a Coffee `buymeacoffee.com/diesstech` (in `.github/FUNDING.yml` and README; buttons in `assets/`).
