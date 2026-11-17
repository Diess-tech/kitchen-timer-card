/*
 * Kitchen Timer Card for Home Assistant
 * One-tap cooking timers (pasta, eggs, rice...) built on Home Assistant timer helpers.
 * https://github.com/Diess-tech/kitchen-timer-card
 * MIT License - (c) 2026 Davide Sanna
 */
const KTC_VERSION = "0.1.0";

const KTC_COLORS = {
  amber: "#ffca28", orange: "#ffa726", "deep-orange": "#ff7043", red: "#ef5350",
  pink: "#ec407a", purple: "#ab47bc", "deep-purple": "#7e57c2", indigo: "#5c6bc0",
  blue: "#42a5f5", "light-blue": "#29b6f6", cyan: "#26c6da", teal: "#26a69a",
  green: "#66bb6a", "light-green": "#9ccc65", lime: "#d4e157", yellow: "#ffee58",
  brown: "#8d6e63", grey: "#bdbdbd", "blue-grey": "#78909c",
};

const KTC_I18N = {
  en: {
    title: "Kitchen timers",
    none_running: "Nothing on the stove",
    running: (n) => (n === 1 ? "1 timer running" : `${n} timers running`),
    ready_at: (t) => `Ready at ${t}`,
    paused: "Paused",
    is_ready: (n) => `${n} is ready!`,
    all_busy: "All timers are busy",
    custom: "Custom timer",
    minutes: "min",
    name_ph: "What's cooking? (optional)",
    start: "Start",
    custom_name: (m) => `Timer ${m} min`,
    no_timers: "Add at least one timer helper to the card configuration (timers:).",
    missing: (e) => `Entity not found: ${e}`,
    dismiss: "OK",
    presets: [
      { group: "Eggs", color: "amber", items: [
        { name: "Soft-boiled", label: "Soft-boiled eggs", minutes: 3, icon: "mdi:egg-outline" },
        { name: "Medium", label: "Medium-boiled eggs", minutes: 6, icon: "mdi:egg-fried" },
        { name: "Hard-boiled", label: "Hard-boiled eggs", minutes: 9, icon: "mdi:egg" },
      ]},
      { group: "Pasta", color: "orange", items: [
        { name: "Spaghetti", minutes: 9, icon: "mdi:pasta" },
        { name: "Fusilli", minutes: 10, icon: "mdi:pasta" },
        { name: "Penne", minutes: 11, icon: "mdi:pasta" },
        { name: "Rigatoni", minutes: 12, icon: "mdi:pasta" },
        { name: "Fresh pasta", minutes: 3, icon: "mdi:noodles" },
        { name: "Gnocchi", minutes: 2, icon: "mdi:circle-multiple-outline" },
      ]},
      { group: "Other", color: "light-green", items: [
        { name: "Rice", minutes: 17, icon: "mdi:rice" },
        { name: "Boiled vegetables", minutes: 12, icon: "mdi:carrot" },
        { name: "Boiled potatoes", minutes: 25, icon: "mdi:food-variant" },
        { name: "Pizza", minutes: 12, icon: "mdi:pizza" },
      ]},
    ],
  },
  it: {
    title: "Timer cucina",
    none_running: "Niente sul fuoco",
    running: (n) => (n === 1 ? "1 timer in corso" : `${n} timer in corso`),
    ready_at: (t) => `Pronto alle ${t}`,
    paused: "In pausa",
    is_ready: (n) => `${n}: pronto!`,
    all_busy: "Tutti i timer sono occupati",
    custom: "Timer libero",
    minutes: "min",
    name_ph: "Cosa cuoce? (facoltativo)",
    start: "Avvia",
    custom_name: (m) => `Timer ${m} min`,
    no_timers: "Aggiungi almeno un timer di Home Assistant nella configurazione della card (timers:).",
    missing: (e) => `Entità non trovata: ${e}`,
    dismiss: "OK",
    presets: [
      { group: "Uova", color: "amber", items: [
        { name: "Alla coque", label: "Uova alla coque", minutes: 3, icon: "mdi:egg-outline" },
        { name: "Bazzotte", label: "Uova bazzotte", minutes: 6, icon: "mdi:egg-fried" },
        { name: "Sode", label: "Uova sode", minutes: 9, icon: "mdi:egg" },
      ]},
      { group: "Pasta", color: "orange", items: [
        { name: "Spaghetti", minutes: 9, icon: "mdi:pasta" },
        { name: "Fusilli", minutes: 10, icon: "mdi:pasta" },
        { name: "Penne", minutes: 11, icon: "mdi:pasta" },
        { name: "Rigatoni", minutes: 12, icon: "mdi:pasta" },
        { name: "Pasta fresca", minutes: 3, icon: "mdi:noodles" },
        { name: "Gnocchi", minutes: 2, icon: "mdi:circle-multiple-outline" },
      ]},
      { group: "Altro", color: "light-green", items: [
        { name: "Riso", minutes: 17, icon: "mdi:rice" },
        { name: "Verdure lesse", minutes: 12, icon: "mdi:carrot" },
        { name: "Patate lesse", minutes: 25, icon: "mdi:food-variant" },
        { name: "Pizza in forno", label: "Pizza", minutes: 12, icon: "mdi:pizza" },
      ]},
    ],
  },
};

function ktcEsc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function ktcHex(color, fallback) {
  const c = KTC_COLORS[color] || color || fallback || "#ffa726";
  const m = /^#?([0-9a-f]{6})$/i.exec(String(c).trim());
  return m ? "#" + m[1] : (KTC_COLORS[fallback] || "#ffa726");
}
function ktcRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function ktcParseDur(s) {
  if (s == null) return 0;
  if (typeof s === "number") return s;
  let neg = false; s = String(s).trim();
  if (s[0] === "-") { neg = true; s = s.slice(1); }
  let days = 0;
  const dm = /^(\d+) days?, (.*)$/.exec(s);
  if (dm) { days = +dm[1]; s = dm[2]; }
  const p = s.split(":").map(Number);
  let sec = 0;
  if (p.length === 3) sec = p[0] * 3600 + p[1] * 60 + p[2];
  else if (p.length === 2) sec = p[0] * 60 + p[1];
  else sec = p[0] || 0;
  sec += days * 86400;
  return neg ? -sec : sec;
}
function ktcFmtDur(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
function ktcHms(sec) {
  sec = Math.max(1, Math.round(sec));
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor((sec % 3600) / 60))}:${pad(sec % 60)}`;
}

class KitchenTimerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._sig = null;
    this._done = [];          // finished timers shown as "ready" banners
    this._beeped = {};        // entity -> finishes_at already announced
    this._tick = this._tick.bind(this);
    this._onClick = this._onClick.bind(this);
    this.shadowRoot.addEventListener("click", this._onClick);
  }

  static getStubConfig(hass) {
    const timers = Object.keys((hass && hass.states) || {}).filter((e) => e.startsWith("timer.")).slice(0, 3);
    return { timers: timers.length ? timers : ["timer.kitchen_1"] };
  }

  setConfig(config) {
    if (!config || !config.timers) throw new Error("kitchen-timer-card: 'timers' is required (list of timer.* entities)");
    const list = Array.isArray(config.timers) ? config.timers : [config.timers];
    this._timers = list.map((t) => (typeof t === "string" ? { entity: t } : { ...t })).filter((t) => t.entity);
    this._config = {
      custom_timer: true,
      sound: true,
      show_presets: true,
      ...config,
    };
    this._sig = null;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._detectFinished();
    const sig = this._signature();
    if (sig !== this._sig) {
      this._sig = sig;
      this._render();
    }
  }

  get _t() {
    const lang = (this._config && this._config.language) ||
      (this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || "en";
    return KTC_I18N[String(lang).slice(0, 2)] || KTC_I18N.en;
  }

  connectedCallback() {
    if (!this._interval) this._interval = setInterval(this._tick, 1000);
  }
  disconnectedCallback() {
    clearInterval(this._interval);
    this._interval = null;
  }

  getCardSize() { return 6; }
  getGridOptions() { return { columns: 12, min_columns: 6 }; }

  // ---------- state helpers ----------
  _state(entity) { return this._hass && this._hass.states[entity]; }

  _name(t, i) {
    if (t.name_entity) {
      const s = this._state(t.name_entity);
      if (s && !["", "unknown", "unavailable"].includes(s.state)) return s.state;
    } else {
      try {
        const v = localStorage.getItem("kitchen-timer-card:" + t.entity);
        if (v) return v;
      } catch (e) { /* storage not available */ }
    }
    const st = this._state(t.entity);
    return (st && st.attributes.friendly_name) || `Timer ${i + 1}`;
  }

  _remaining(st) {
    if (!st) return 0;
    if (st.state === "active" && st.attributes.finishes_at) {
      return (new Date(st.attributes.finishes_at).getTime() - Date.now()) / 1000;
    }
    return ktcParseDur(st.attributes.remaining);
  }

  _signature() {
    if (!this._hass || !this._timers) return "";
    const parts = [this._t === KTC_I18N.it ? "it" : "en"];
    for (const t of this._timers) {
      const s = this._state(t.entity);
      parts.push(s ? `${s.state}|${s.attributes.finishes_at || ""}|${s.attributes.remaining || ""}|${s.attributes.duration || ""}` : "x");
      if (t.name_entity) { const n = this._state(t.name_entity); parts.push(n ? n.state : "x"); }
    }
    return parts.join("~");
  }

  _busy() {
    return this._timers.filter((t) => {
      const s = this._state(t.entity);
      return s && (s.state === "active" || s.state === "paused");
    });
  }

  // ---------- actions ----------
  _call(domain, service, data) {
    return this._hass.callService(domain, service, data).catch((e) => {
      this._toast(e && e.message ? e.message : String(e));
    });
  }

  async _start(label, minutes) {
    this._unlockAudio();
    const free = this._timers.find((t) => {
      const s = this._state(t.entity);
      return s && s.state === "idle";
    });
    if (!free) { this._toast(this._t.all_busy); return; }
    const secs = Math.round(Number(minutes) * 60);
    if (!(secs > 0)) return;
    if (free.name_entity) {
      const ne = this._state(free.name_entity);
      const max = (ne && ne.attributes.max) || 100;
      await this._call("input_text", "set_value", { entity_id: free.name_entity, value: String(label).slice(0, max) });
    } else {
      try { localStorage.setItem("kitchen-timer-card:" + free.entity, label); } catch (e) { /* ignore */ }
    }
    await this._call("timer", "start", { entity_id: free.entity, duration: ktcHms(secs) });
  }

  _adjust(entity, delta) {
    const st = this._state(entity);
    if (!st || st.state !== "active") return;
    const rem = this._remaining(st) + delta;
    if (rem < 1) return;
    // timer.start with a new duration restarts the running timer: works for +1 as well
    // (timer.change refuses to go beyond the original duration).
    this._call("timer", "start", { entity_id: entity, duration: ktcHms(rem) });
  }

  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset && n.dataset.action);
    if (!el) return;
    this._unlockAudio();
    const a = el.dataset.action, e = el.dataset.entity;
    if (a === "preset") {
      const [g, i] = el.dataset.idx.split(".").map(Number);
      const it = this._presets()[g].items[i];
      this._start(it.label || it.name, it.minutes);
    } else if (a === "custom") {
      const min = this.shadowRoot.getElementById("ktc-min");
      const nm = this.shadowRoot.getElementById("ktc-name");
      const m = parseFloat(String(min.value).replace(",", "."));
      if (!(m > 0)) { min.focus(); return; }
      const label = (nm.value || "").trim() || this._t.custom_name(m);
      this._start(label, m);
      nm.value = "";
    } else if (a === "plus") this._adjust(e, 60);
    else if (a === "minus") this._adjust(e, -60);
    else if (a === "pause") this._call("timer", "pause", { entity_id: e });
    else if (a === "resume") this._call("timer", "start", { entity_id: e });
    else if (a === "cancel") {
      this._call("timer", "cancel", { entity_id: e });
      const t = this._timers.find((x) => x.entity === e);
      if (t && !t.name_entity) { try { localStorage.removeItem("kitchen-timer-card:" + e); } catch (er) { /* ignore */ } }
    } else if (a === "dismiss") {
      this._done = this._done.filter((d) => d.id !== el.dataset.id);
      this._render();
    }
  }

  // ---------- sound ----------
  _unlockAudio() {
    if (!this._config || this._config.sound === false) return;
    try {
      if (!this._ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this._ac = new AC();
      }
      if (this._ac && this._ac.state === "suspended") this._ac.resume();
    } catch (e) { /* audio not available */ }
  }

  _beep() {
    if (!this._config || this._config.sound === false || !this._ac) return;
    try {
      const ac = this._ac, now = ac.currentTime;
      for (let k = 0; k < 3; k++) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = 880;
        const t0 = now + k * 0.45;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
        o.connect(g); g.connect(ac.destination);
        o.start(t0); o.stop(t0 + 0.32);
      }
    } catch (e) { /* ignore */ }
  }

  // A timer that goes active -> idle at (about) its finish time has finished, not been cancelled.
  _detectFinished() {
    if (!this._timers) return;
    this._prev = this._prev || {};
    this._timers.forEach((t, i) => {
      const st = this._state(t.entity);
      const prev = this._prev[t.entity];
      if (st && prev && prev.state === "active" && st.state === "idle" && prev.fin) {
        const late = Date.now() - new Date(prev.fin).getTime();
        if (late > -3000 && this._beeped[t.entity] !== prev.fin) {
          this._beeped[t.entity] = prev.fin;
          this._done.unshift({ id: t.entity + prev.fin, name: prev.name, at: Date.now() });
          this._beep();
          this._sig = null; // force re-render
        }
      }
      if (st) {
        this._prev[t.entity] = {
          state: st.state,
          fin: st.attributes.finishes_at,
          // keep the last known name: automations often clear the name helper at finish
          name: st.state === "idle" && prev ? prev.name : this._name(t, i),
        };
      }
    });
  }

  // ---------- ticking ----------
  _tick() {
    if (!this._hass || !this._timers) return;
    let rerender = false;
    this._timers.forEach((t, i) => {
      const st = this._state(t.entity);
      if (!st || st.state !== "active") return;
      const rem = this._remaining(st);
      const el = this.shadowRoot.getElementById("ktc-rem-" + i);
      if (el) el.textContent = ktcFmtDur(rem);
      const bar = this.shadowRoot.getElementById("ktc-bar-" + i);
      const dur = ktcParseDur(st.attributes.duration);
      if (bar && dur > 0) bar.style.width = Math.max(0, Math.min(100, (rem / dur) * 100)) + "%";
      const fin = st.attributes.finishes_at;
      if (rem <= 0 && this._beeped[t.entity] !== fin) {
        this._beeped[t.entity] = fin;
        this._done.unshift({ id: t.entity + fin, name: this._name(t, i), at: Date.now() });
        this._beep();
        rerender = true;
      }
    });
    const before = this._done.length;
    this._done = this._done.filter((d) => Date.now() - d.at < 120000).slice(0, 3);
    if (rerender || before !== this._done.length) this._render();
  }

  _toast(msg) {
    const el = this.shadowRoot.getElementById("ktc-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove("show"), 3000);
  }

  _presets() {
    const p = this._config.presets;
    return Array.isArray(p) ? p : this._t.presets;
  }

  // ---------- render ----------
  _render() {
    if (!this._config || !this._hass) return;
    const T = this._t;
    const cfg = this._config;
    const busy = this._busy();
    const title = cfg.title === undefined ? T.title : cfg.title;

    let body = "";
    if (!this._timers.length) {
      body = `<div class="warn">${ktcEsc(T.no_timers)}</div>`;
    }
    const missing = this._timers.filter((t) => !this._state(t.entity));
    missing.forEach((t) => { body += `<div class="warn">${ktcEsc(T.missing(t.entity))}</div>`; });

    // ready banners
    body += this._done.map((d) => `
      <div class="ready">
        <ha-icon icon="mdi:bell-ring"></ha-icon>
        <span>${ktcEsc(T.is_ready(d.name))}</span>
        <button class="pill" data-action="dismiss" data-id="${ktcEsc(d.id)}">${ktcEsc(T.dismiss)}</button>
      </div>`).join("");

    // running timers
    if (busy.length) {
      body += `<div class="running">` + this._timers.map((t, i) => {
        const st = this._state(t.entity);
        if (!st || (st.state !== "active" && st.state !== "paused")) return "";
        const active = st.state === "active";
        const rem = this._remaining(st);
        const dur = ktcParseDur(st.attributes.duration);
        const pct = dur > 0 ? Math.max(0, Math.min(100, (rem / dur) * 100)) : 0;
        let sub = T.paused;
        if (active && st.attributes.finishes_at) {
          const d = new Date(st.attributes.finishes_at);
          sub = T.ready_at(d.toLocaleTimeString(this._hass.locale && this._hass.locale.language || undefined, { hour: "2-digit", minute: "2-digit" }));
        }
        const e = ktcEsc(t.entity);
        return `
          <div class="timer ${active ? "" : "is-paused"}">
            <div class="trow">
              <ha-icon class="ticon" icon="${active ? "mdi:timer-sand" : "mdi:pause-circle-outline"}"></ha-icon>
              <div class="tinfo">
                <div class="tname">${ktcEsc(this._name(t, i))}</div>
                <div class="tsub">${ktcEsc(sub)}</div>
              </div>
              <div class="trem" id="ktc-rem-${i}">${ktcFmtDur(rem)}</div>
            </div>
            <div class="bar"><div class="fill" id="ktc-bar-${i}" style="width:${pct}%"></div></div>
            <div class="tbtns">
              <button class="ctl" data-action="minus" data-entity="${e}" ${active && rem > 61 ? "" : "disabled"}>−1</button>
              <button class="ctl" data-action="plus" data-entity="${e}" ${active ? "" : "disabled"}>+1</button>
              <button class="ctl" data-action="${active ? "pause" : "resume"}" data-entity="${e}"><ha-icon icon="${active ? "mdi:pause" : "mdi:play"}"></ha-icon></button>
              <button class="ctl danger" data-action="cancel" data-entity="${e}"><ha-icon icon="mdi:close"></ha-icon></button>
            </div>
          </div>`;
      }).join("") + `</div>`;
    }

    // presets
    if (cfg.show_presets !== false) {
      body += this._presets().map((g, gi) => {
        const hex = ktcHex(g.color, "orange");
        const items = (g.items || []).map((it, ii) => `
          <button class="preset" data-action="preset" data-idx="${gi}.${ii}"
            style="background:${ktcRgba(hex, 0.12)};border-color:${ktcRgba(hex, 0.35)}">
            <ha-icon icon="${ktcEsc(it.icon || g.icon || "mdi:timer-outline")}" style="color:${hex}"></ha-icon>
            <span class="pname">${ktcEsc(it.name)}</span>
            <span class="pmin">${ktcEsc(it.minutes)} ${ktcEsc(T.minutes)}</span>
          </button>`).join("");
        return `${g.group ? `<div class="group">${ktcEsc(g.group)}</div>` : ""}<div class="grid">${items}</div>`;
      }).join("");
    }

    // custom timer
    if (cfg.custom_timer !== false) {
      body += `
        <div class="group">${ktcEsc(T.custom)}</div>
        <div class="custom">
          <input id="ktc-min" type="number" inputmode="decimal" min="0.5" step="0.5" value="${ktcEsc(cfg.custom_default || 5)}" aria-label="${ktcEsc(T.minutes)}">
          <span class="unit">${ktcEsc(T.minutes)}</span>
          <input id="ktc-name" type="text" placeholder="${ktcEsc(T.name_ph)}" maxlength="60">
          <button class="go" data-action="custom"><ha-icon icon="mdi:play"></ha-icon>${ktcEsc(T.start)}</button>
        </div>`;
    }

    const keepMin = this.shadowRoot.getElementById("ktc-min");
    const keepName = this.shadowRoot.getElementById("ktc-name");
    const minVal = keepMin ? keepMin.value : null, nameVal = keepName ? keepName.value : null;
    const focused = this.shadowRoot.activeElement ? this.shadowRoot.activeElement.id : null;

    this.shadowRoot.innerHTML = `
      <style>${KitchenTimerCard.styles}</style>
      <ha-card>
        ${title ? `<div class="head">
          <ha-icon icon="${busy.length ? "mdi:pot-steam" : "mdi:timer-outline"}" class="hicon"></ha-icon>
          <div><div class="htitle">${ktcEsc(title)}</div>
          <div class="hsub">${ktcEsc(busy.length ? T.running(busy.length) : T.none_running)}</div></div>
        </div>` : ""}
        <div class="body">${body}</div>
        <div id="ktc-toast" class="toast"></div>
      </ha-card>`;

    if (minVal !== null) { const m = this.shadowRoot.getElementById("ktc-min"); if (m) m.value = minVal; }
    if (nameVal !== null) { const n = this.shadowRoot.getElementById("ktc-name"); if (n) n.value = nameVal; }
    if (focused) { const f = this.shadowRoot.getElementById(focused); if (f) f.focus(); }
  }
}

KitchenTimerCard.styles = `
  :host { display: block; }
  ha-card { padding: 16px; position: relative; overflow: hidden; }
  .head { display: flex; align-items: center; margin-bottom: 12px; }
  .hicon { --mdc-icon-size: 28px; color: var(--state-icon-color, #ffa726); margin-right: 12px;
    background: rgba(255,167,38,0.15); border-radius: 50%; padding: 8px; }
  .htitle { font-size: 1.15rem; font-weight: 700; color: var(--primary-text-color); }
  .hsub { font-size: 0.85rem; color: var(--secondary-text-color); }
  .group { font-size: 0.8rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    color: var(--secondary-text-color); margin: 14px 2px 8px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); grid-gap: 8px; }
  button { font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .preset { display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 12px 6px; border-radius: 16px; border: 1px solid; color: var(--primary-text-color);
    min-height: 88px; transition: transform .08s ease; }
  .preset:active { transform: scale(0.95); }
  .preset ha-icon { --mdc-icon-size: 26px; margin-bottom: 6px; }
  .pname { font-weight: 600; font-size: 0.92rem; text-align: center; line-height: 1.15; }
  .pmin { font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 2px; }
  .running { display: grid; grid-gap: 10px; }
  .timer { border-radius: 18px; padding: 12px 14px; background: rgba(255,167,38,0.12);
    border: 1px solid rgba(255,167,38,0.4); }
  .timer.is-paused { background: rgba(127,127,127,0.10); border-color: rgba(127,127,127,0.35); }
  .trow { display: flex; align-items: center; }
  .ticon { --mdc-icon-size: 26px; color: #ffa726; margin-right: 10px; }
  .is-paused .ticon { color: var(--secondary-text-color); }
  .tinfo { flex: 1; min-width: 0; }
  .tname { font-weight: 700; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tsub { font-size: 0.82rem; color: var(--secondary-text-color); }
  .trem { font-size: 1.9rem; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--primary-text-color); margin-left: 8px; }
  .bar { height: 6px; border-radius: 3px; background: rgba(127,127,127,0.25); margin: 10px 0; overflow: hidden; }
  .fill { height: 100%; background: #ffa726; border-radius: 3px; transition: width 1s linear; }
  .is-paused .fill { background: var(--secondary-text-color); }
  .tbtns { display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 8px; }
  .ctl { border: none; border-radius: 12px; padding: 8px 0; min-height: 40px; font-weight: 700; font-size: 1rem;
    background: rgba(127,127,127,0.18); color: var(--primary-text-color); display: flex; align-items: center; justify-content: center; }
  .ctl[disabled] { opacity: .35; cursor: default; }
  .ctl.danger { background: rgba(239,83,80,0.18); color: #ef5350; }
  .ctl ha-icon { --mdc-icon-size: 22px; }
  .ready { display: flex; align-items: center; padding: 10px 12px; margin-bottom: 10px; border-radius: 16px;
    background: rgba(102,187,106,0.18); border: 1px solid rgba(102,187,106,0.5); color: var(--primary-text-color);
    font-weight: 700; animation: ktc-pulse 1.2s ease-in-out infinite; }
  .ready ha-icon { color: #66bb6a; margin-right: 10px; }
  .ready span { flex: 1; }
  .pill { border: none; border-radius: 999px; padding: 6px 14px; background: #66bb6a; color: #fff; font-weight: 700; }
  @keyframes ktc-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(102,187,106,0.0); } 50% { box-shadow: 0 0 0 6px rgba(102,187,106,0.25); } }
  .custom { display: grid; grid-template-columns: 76px auto 1fr auto; grid-gap: 8px; align-items: center; }
  .custom input { font: inherit; padding: 10px; border-radius: 12px; border: 1px solid rgba(127,127,127,0.35);
    background: rgba(127,127,127,0.10); color: var(--primary-text-color); min-width: 0; }
  .unit { color: var(--secondary-text-color); }
  .go { border: none; border-radius: 12px; padding: 10px 14px; background: var(--primary-color, #03a9f4); color: #fff;
    font-weight: 700; display: flex; align-items: center; }
  .go ha-icon { --mdc-icon-size: 20px; margin-right: 4px; }
  @media (max-width: 420px) { .custom { grid-template-columns: 70px auto 1fr; } .custom .go { grid-column: 1 / -1; justify-content: center; } }
  .warn { padding: 10px; border-radius: 12px; background: rgba(239,83,80,0.15); color: var(--primary-text-color); margin-bottom: 8px; }
  .toast { position: absolute; left: 50%; bottom: 12px; transform: translate(-50%, 20px); opacity: 0;
    background: rgba(33,33,33,0.92); color: #fff; padding: 8px 14px; border-radius: 999px; font-size: .9rem;
    transition: all .25s ease; pointer-events: none; white-space: nowrap; }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }
`;

if (!customElements.get("kitchen-timer-card")) {
  customElements.define("kitchen-timer-card", KitchenTimerCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "kitchen-timer-card")) {
  window.customCards.push({
    type: "kitchen-timer-card",
    name: "Kitchen Timer Card",
    description: "One-tap cooking timers (pasta, eggs, rice...) built on Home Assistant timer helpers.",
    preview: true,
    documentationURL: "https://github.com/Diess-tech/kitchen-timer-card",
  });
}
console.info(`%c KITCHEN-TIMER-CARD %c v${KTC_VERSION} `, "color:#fff;background:#ffa726;font-weight:700", "color:#ffa726");
