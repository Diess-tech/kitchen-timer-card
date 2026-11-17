# Kitchen Timer Card — notes for Claude

- Single-file vanilla JS custom card (`kitchen-timer-card.js`), no build step, no dependencies. Shadow DOM, re-renders only when the timer/name states change; a 1 s interval updates the countdown text.
- Timers are HA `timer.*` helpers. Optional `name_entity` (`input_text.*`) per timer holds what is cooking; without it the name goes to localStorage.
- +1/−1 uses `timer.start` with the new remaining duration (HA `timer.change` refuses to exceed the original duration).
- Finish detection: active → idle transition near `finishes_at` (in `_detectFinished`), plus the countdown reaching 0 in `_tick`. The last known name is kept because automations often clear the name helper at finish.
- Built-in presets and UI strings live in `KTC_I18N` (en, it).
- Keep `hacs.json` filename in sync with the JS file name. Bump `KTC_VERSION` and create a GitHub release for every version.
- The author (Davide) is Italian and a hobbyist: explain things to him in simple Italian.
- In Davide's Home Assistant the original version lives on the "plancia-frigo" dashboard (#timer popup) with timer.timer_cucina_1..3 and input_text.nome_timer_cucina_1..3; voice alert by automation.timer_cucina_avviso_fine_tempo_sul_tablet.
