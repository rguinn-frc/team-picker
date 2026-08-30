//=============================================================
// APP.JS — Chel Matchups
// The seed math (hours since epoch) and the copy-to-sheet
// format are load-bearing: they keep every client in sync and
// feed the Google Sheet pipeline. Change them with care.
//=============================================================

//-------------------------------------------------------------
// CONFIG
//-------------------------------------------------------------
const ENABLE_LIVE_STATS = true;
const BANNED_ABBRS = ["TBL", "COL", "EDM", "WPG"]; // Lightning, Avalanche, Oilers, Jets
const PARTNERS = ["Ryan", "Tom", "Dylan"]; // Nick's possible partners
const PLAYERS = ["Tom", "Ryan", "Nick", "Dylan"];
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1ZS1sG6XIYgm1bOeSSqkQ8kQRUQyzImOlMWao6Nk0YLw/edit";

// Runtime state
let teams = [];
let results = {};              // selected winner per game index
let currentMatchInfo = [];
let lastSeed = null;
let lastMatchups = [];
let lastPartners = [];
let lastMirror = false;

function getOpposingPlayers(nickPartner) {
  return PLAYERS.filter(p => p !== "Nick" && p !== nickPartner);
}

//-------------------------------------------------------------
// FALLBACK TEAM DATA (used when teams.json can't load)
//-------------------------------------------------------------
const FALLBACK_TEAMS = [
  { name: 'Colorado Avalanche', abbr: 'COL', pts: 37, gf: 4.00, ga: 2.18 },
  { name: 'Carolina Hurricanes', abbr: 'CAR', pts: 30, gf: 3.50, ga: 2.91 },
  { name: 'Dallas Stars', abbr: 'DAL', pts: 30, gf: 3.18, ga: 2.73 },
  { name: 'Anaheim Ducks', abbr: 'ANA', pts: 29, gf: 3.59, ga: 3.14 },
  { name: 'New Jersey Devils', abbr: 'NJD', pts: 29, gf: 3.05, ga: 3.05 },
  { name: 'Tampa Bay Lightning', abbr: 'TBL', pts: 28, gf: 3.14, ga: 2.73 },
  { name: 'Seattle Kraken', abbr: 'SEA', pts: 28, gf: 2.59, ga: 2.55 },
  { name: 'Los Angeles Kings', abbr: 'LAK', pts: 28, gf: 2.65, ga: 2.61 },
  { name: 'Minnesota Wild', abbr: 'MIN', pts: 28, gf: 2.87, ga: 2.78 },
  { name: 'New York Islanders', abbr: 'NYI', pts: 28, gf: 3.04, ga: 2.78 },
  { name: 'Vegas Golden Knights', abbr: 'VGK', pts: 27, gf: 3.09, ga: 2.91 },
  { name: 'Utah Mammoth', abbr: 'UTA', pts: 27, gf: 3.09, ga: 2.96 },
  { name: 'Detroit Red Wings', abbr: 'DET', pts: 27, gf: 2.91, ga: 3.22 },
  { name: 'Boston Bruins', abbr: 'BOS', pts: 26, gf: 3.08, ga: 3.21 },
  { name: 'Washington Capitals', abbr: 'WSH', pts: 26, gf: 3.30, ga: 2.65 },
  { name: 'Ottawa Senators', abbr: 'OTT', pts: 26, gf: 3.14, ga: 3.23 },
  { name: 'Montreal Canadiens', abbr: 'MTL', pts: 25, gf: 3.43, ga: 3.52 },
  { name: 'Florida Panthers', abbr: 'FLA', pts: 25, gf: 3.14, ga: 3.05 },
  { name: 'Philadelphia Flyers', abbr: 'PHI', pts: 25, gf: 2.67, ga: 2.81 },
  { name: 'Pittsburgh Penguins', abbr: 'PIT', pts: 25, gf: 3.05, ga: 2.62 },
  { name: 'Edmonton Oilers', abbr: 'EDM', pts: 25, gf: 3.08, ga: 3.54 },
  { name: 'San Jose Sharks', abbr: 'SJS', pts: 25, gf: 2.91, ga: 3.09 },
  { name: 'Columbus Blue Jackets', abbr: 'CBJ', pts: 25, gf: 2.87, ga: 3.26 },
  { name: 'New York Rangers', abbr: 'NYR', pts: 24, gf: 2.50, ga: 2.63 },
  { name: 'Chicago Blackhawks', abbr: 'CHI', pts: 24, gf: 3.14, ga: 2.77 },
  { name: 'Winnipeg Jets', abbr: 'WPG', pts: 24, gf: 3.14, ga: 2.81 },
  { name: 'Buffalo Sabres', abbr: 'BUF', pts: 22, gf: 3.18, ga: 3.41 },
  { name: 'Toronto Maple Leafs', abbr: 'TOR', pts: 21, gf: 3.36, ga: 3.73 },
  { name: 'St. Louis Blues', abbr: 'STL', pts: 20, gf: 2.65, ga: 3.61 },
  { name: 'Vancouver Canucks', abbr: 'VAN', pts: 20, gf: 3.00, ga: 3.74 },
  { name: 'Calgary Flames', abbr: 'CGY', pts: 19, gf: 2.38, ga: 2.96 },
  { name: 'Nashville Predators', abbr: 'NSH', pts: 16, gf: 2.32, ga: 3.68 }
];

//-------------------------------------------------------------
// DATA LOADING
//-------------------------------------------------------------
async function fetchLiveTeamStatsViaProxy() {
  const resp = await fetch("teams.json", { cache: "no-cache" });
  if (!resp.ok) throw new Error("teams.json fetch failed: " + resp.status);
  return resp.json();
}

async function loadResults() {
  try {
    const resp = await fetch("results.json", { cache: "no-cache" });
    if (!resp.ok) throw new Error("results.json fetch failed");
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Could not load results.json", err.message);
    return [];
  }
}

//-------------------------------------------------------------
// RATINGS + SEEDED RNG + MATCHUP GENERATOR
// (deterministic: the same seed must produce the same slate on
//  every client — change nothing here without everyone updating)
//-------------------------------------------------------------
function computeRatings(list) {
  return list.map(t => {
    let ppg = Number(t.ppg);
    if (!Number.isFinite(ppg) || ppg <= 0) {
      ppg = Number(t.pts || 0);
    }
    return { ...t, ppg, rating: ppg };
  });
}

function createLCG(seed) {
  const m = 2147483647;
  const a = 16807;
  let state = seed % m;
  return () => {
    state = (state * a) % m;
    return state / m;
  };
}

function generateMatchups(seed) {
  const ratedAll = computeRatings(
    teams.filter(t => !BANNED_ABBRS.includes(t.abbr))
  );

  const sorted = ratedAll.slice().sort((a, b) => b.rating - a.rating);
  const poolCount = Math.max(1, Math.round(sorted.length * 0.75));
  const topHalf = sorted.slice(0, poolCount);

  const rng = createLCG(seed);

  const anchors = [...topHalf];
  for (let i = anchors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [anchors[i], anchors[j]] = [anchors[j], anchors[i]];
  }

  // Walk the shuffled anchor pool until we have 3 full matchups.
  // (The old version pre-picked exactly 3 anchors; if one had already been
  // consumed as an earlier anchor's opponent, the night came up a game short.)
  const matchups = [];
  const usedAbbrs = new Set();

  for (const anchor of anchors) {
    if (matchups.length >= 3) break;
    if (usedAbbrs.has(anchor.abbr)) continue;
    usedAbbrs.add(anchor.abbr);

    const candidates = ratedAll
      .filter(t => !usedAbbrs.has(t.abbr))
      .sort(
        (a, b) =>
          Math.abs(a.rating - anchor.rating) -
          Math.abs(b.rating - anchor.rating)
      );

    const nearest = candidates.slice(0, Math.min(8, candidates.length));
    const opp = nearest[Math.floor(rng() * nearest.length)];

    if (opp) {
      usedAbbrs.add(opp.abbr);
      matchups.push([anchor, opp]);
    }
  }

  return matchups;
}

function mixSeed(seed) {
  return (Math.imul(seed ^ 0x9e3779b1, 1664525) + 1013904223) >>> 0;
}

function jitterSeed(seed) {
  let x = seed >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  x = (x + 0x9e3779b9) >>> 0;
  return x;
}

function assignPartners(seed, count) {
  const mixed = mixSeed(seed + 1337);
  const jittered = jitterSeed(seed * 3 + 7) ^ jitterSeed(seed ^ 0x5bd1e995);
  const rng = createLCG((mixed ^ jittered) >>> 0);

  const pool = [...PARTNERS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const rotateBy = Math.floor(rng() * pool.length) % pool.length;
  const rotated = pool.slice(rotateBy).concat(pool.slice(0, rotateBy));

  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push(rotated[i % rotated.length]);
  }
  return picks;
}

//-------------------------------------------------------------
// DAY SEED HELPERS — everything "novel" is picked from the
// Central-Time calendar date, so the whole crew sees the same
// banner / fortune / tagline all day, and a fresh one tomorrow.
//-------------------------------------------------------------
function chicagoDateString(d = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(d); // "MM/DD/YYYY"
}

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function dailyRng(extra = "") {
  const key = chicagoDateString() + "|" + extra;
  return createLCG((hashString(key) % 2147483646) + 1);
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

//-------------------------------------------------------------
// SEED HANDLING
//-------------------------------------------------------------
function getSeed() {
  const input = document.getElementById("seedInput").value;
  if (input) {
    const parsed = parseInt(input, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Math.floor(Date.now() / 3600000);
}

function updateHourRangeDisplay(seed) {
  const displayEl = document.getElementById("hourRangeDisplay");
  if (!displayEl) return;
  const startUtc = new Date(seed * 3600000);
  const endUtc = new Date((seed + 1) * 3600000);
  // Compact: "Aug 30 · 12–1 PM CT" (year shown only when it isn't this year)
  const chi = (d, opts) => new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", ...opts }).format(d);
  const seedYear = chi(startUtc, { year: "numeric" });
  const nowYear = chi(new Date(), { year: "numeric" });
  const dateStr = chi(startUtc, { month: "short", day: "numeric" }) + (seedYear === nowYear ? "" : ` ${seedYear}`);
  const startHr = chi(startUtc, { hour: "numeric", hour12: true });   // "12 PM"
  const endHr = chi(endUtc, { hour: "numeric", hour12: true });
  const sameMeridiem = startHr.slice(-2) === endHr.slice(-2);
  const range = sameMeridiem ? `${startHr.replace(/ (AM|PM)/, "")}–${endHr}` : `${startHr}–${endHr}`;
  displayEl.innerHTML = `<span class="seed-chip">SEED ${seed}</span> ${dateStr} · ${range} CT`;

  const liveSeed = Math.floor(Date.now() / 3600000);
  const driftEl = document.getElementById("seedDrift");
  if (driftEl) {
    if (seed === liveSeed) {
      driftEl.textContent = "⏱️ live hour — everyone sees this slate";
      driftEl.className = "seed-drift live";
    } else {
      const diff = seed - liveSeed;
      driftEl.textContent = diff > 0
        ? `🔮 ${diff} hour${Math.abs(diff) === 1 ? "" : "s"} into the future`
        : `🕰️ ${-diff} hour${Math.abs(diff) === 1 ? "" : "s"} in the past`;
      driftEl.className = "seed-drift drift";
    }
  }
}

//-------------------------------------------------------------
// MATCHUP RENDERING (function-first: big tap targets, clear info)
//-------------------------------------------------------------
function teamCardHTML(team) {
  const logoUrl = `https://assets.nhle.com/logos/nhl/svg/${team.abbr}_dark.svg`;
  return `
    <img class="team-logo" src="${logoUrl}" alt="${team.name} logo" onerror="this.style.visibility='hidden'">
    <div class="team-abbr">${team.abbr}</div>
    <div class="team-name">${team.name}</div>
    <div class="team-stats">
      <span title="Points per game">${(team.ppg ?? 0).toFixed(2)} P/G</span>
      <span title="Goals for / against per game">${team.gf.toFixed(1)} GF · ${team.ga.toFixed(1)} GA</span>
    </div>
    <div class="win-stamp" aria-hidden="true">W</div>
  `;
}

function renderMatchups(matchups, seed, options = {}) {
  const { mirror = false, partners: partnersOverride } = options;
  const container = document.getElementById("matchups");
  container.innerHTML = "";

  results = {};
  currentMatchInfo = [];

  updateHourRangeDisplay(seed);

  const partners = partnersOverride || assignPartners(seed, matchups.length);

  matchups.forEach((pair, index) => {
    const [t1, t2] = pair;
    const baseNickTeam = t1.rating >= t2.rating ? t1 : t2;
    const baseOtherTeam = baseNickTeam === t1 ? t2 : t1;
    const nickTeam = mirror ? baseOtherTeam : baseNickTeam;
    const otherTeam = mirror ? baseNickTeam : baseOtherTeam;
    const partner = partners[index];

    currentMatchInfo[index] = { nickTeam, otherTeam, partner };

    const card = document.createElement("section");
    card.className = "matchup-card";
    card.innerHTML = `
      <div class="matchup-head">
        <span class="game-label">GAME ${index + 1}</span>
        <button type="button" class="swap-btn" title="Swap which side Nick's duo plays">⇄ swap</button>
      </div>
      <div class="matchup-body">
        <button type="button" class="team-side" data-side="nick"></button>
        <div class="vs-divider"><span>VS</span></div>
        <button type="button" class="team-side" data-side="other"></button>
      </div>
      <div class="edge-meter" title="Rating edge">
        <div class="edge-fill"></div>
      </div>
    `;

    const sideNick = card.querySelector('[data-side="nick"]');
    const sideOther = card.querySelector('[data-side="other"]');
    const edgeFill = card.querySelector(".edge-fill");

    function paint() {
      const info = currentMatchInfo[index];
      sideNick.innerHTML = `<div class="duo-tag">🎯 Nick + ${info.partner}</div>` + teamCardHTML(info.nickTeam);
      sideOther.innerHTML = `<div class="duo-tag ghost">&nbsp;</div>` + teamCardHTML(info.otherTeam);
      sideNick.dataset.abbr = info.nickTeam.abbr;
      sideOther.dataset.abbr = info.otherTeam.abbr;
      sideNick.classList.add("nick-side");

      // rating edge bar: percentage toward the left (Nick) side
      const rn = info.nickTeam.rating, ro = info.otherTeam.rating;
      const totalGap = rn + ro || 1;
      const pct = Math.round((rn / totalGap) * 100);
      edgeFill.style.width = pct + "%";
      card.querySelector(".edge-meter").title =
        `Rating edge: ${info.nickTeam.abbr} ${rn.toFixed(2)} vs ${info.otherTeam.abbr} ${ro.toFixed(2)}`;

      applyWinner();
    }

    function applyWinner() {
      const w = results[index];
      [sideNick, sideOther].forEach(s => s.classList.toggle("winner", s.dataset.abbr === w));
    }

    sideNick.addEventListener("click", () => { results[index] = sideNick.dataset.abbr; applyWinner(); });
    sideOther.addEventListener("click", () => { results[index] = sideOther.dataset.abbr; applyWinner(); });

    card.querySelector(".swap-btn").addEventListener("click", () => {
      const info = currentMatchInfo[index];
      currentMatchInfo[index] = { nickTeam: info.otherTeam, otherTeam: info.nickTeam, partner: info.partner };
      paint();
    });

    paint();
    container.appendChild(card);
  });

  lastSeed = seed;
  lastMatchups = matchups;
  lastPartners = partners;
  lastMirror = mirror;
  const mirrorBtn = document.getElementById("mirrorBtn");
  if (mirrorBtn) {
    mirrorBtn.textContent = mirror ? "⇆ unmirror" : "⇆ mirror";
  }
}

//-------------------------------------------------------------
// SCOREBOARD MATH
//-------------------------------------------------------------
function groupByMatchup(entries) {
  const byMatchup = {};
  entries.forEach(entry => {
    const m = entry.matchup;
    if (!byMatchup[m]) byMatchup[m] = [];
    byMatchup[m].push(entry);
  });
  return byMatchup;
}

function computeScoreboard(entries) {
  const stats = {};
  PLAYERS.forEach(p => {
    stats[p] = { wins: 0, losses: 0, gcds: 0, lcds: 0 };
  });
  entries.forEach(entry => {
    const winners = [entry["Winning Player 1"], entry["Winning Player 2"]].filter(Boolean);
    const losers = [entry["Losing Player 1"], entry["Losing Player 2"]].filter(Boolean);
    PLAYERS.forEach(p => {
      if (winners.includes(p)) stats[p].wins += 1;
      if (losers.includes(p)) stats[p].losses += 1;
    });
  });
  const byMatchup = groupByMatchup(entries);
  Object.values(byMatchup).forEach(group => {
    PLAYERS.forEach(p => {
      const winAll = group.length > 0 && group.every(e => {
        const winners = [e["Winning Player 1"], e["Winning Player 2"]];
        return winners.includes(p);
      });
      if (winAll && group.length >= 3) stats[p].gcds += 1;
      const loseAll = group.length > 0 && group.every(e => {
        const losers = [e["Losing Player 1"], e["Losing Player 2"]];
        return losers.includes(p);
      });
      if (loseAll && group.length >= 3) stats[p].lcds += 1;
    });
  });
  return stats;
}

function parseEntryDate(str) {
  // "MM/DD/YYYY"
  if (!str) return null;
  const m = String(str).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
}

function daysAgo(dateStr) {
  const d = parseEntryDate(dateStr);
  if (!d) return null;
  const today = parseEntryDate(chicagoDateString());
  return Math.max(0, Math.round((today - d) / 86400000));
}

// Per-player extras: last GCD/LCD dates + per-game streak
function computeExtras(entries) {
  const extras = {};
  PLAYERS.forEach(p => {
    extras[p] = { lastGcd: null, lastLcd: null, streakType: null, streakLen: 0 };
  });
  const byMatchup = groupByMatchup(entries);
  const seedsAsc = Object.keys(byMatchup).sort((a, b) => parseInt(a) - parseInt(b));

  seedsAsc.forEach(seedKey => {
    const group = byMatchup[seedKey];
    if (group.length < 3) return;
    PLAYERS.forEach(p => {
      const winAll = group.every(e => [e["Winning Player 1"], e["Winning Player 2"]].includes(p));
      const loseAll = group.every(e => [e["Losing Player 1"], e["Losing Player 2"]].includes(p));
      if (winAll) extras[p].lastGcd = group[0]?.date || null;
      if (loseAll) extras[p].lastLcd = group[0]?.date || null;
    });
  });

  // Per-game win/loss streak, walking backwards through all games in seed order
  const allGames = [];
  seedsAsc.forEach(seedKey => byMatchup[seedKey].forEach(e => allGames.push(e)));
  PLAYERS.forEach(p => {
    let type = null, len = 0;
    for (let i = allGames.length - 1; i >= 0; i--) {
      const e = allGames[i];
      const won = [e["Winning Player 1"], e["Winning Player 2"]].includes(p);
      const lost = [e["Losing Player 1"], e["Losing Player 2"]].includes(p);
      if (!won && !lost) continue;
      const t = won ? "W" : "L";
      if (type === null) { type = t; len = 1; }
      else if (t === type) len++;
      else break;
    }
    extras[p].streakType = type;
    extras[p].streakLen = len;
  });

  return extras;
}

function getGcdTitle(count) {
  if (count === 0) return "";
  return GCD_TITLES[Math.min(count, GCD_TITLES.length - 1)];
}

function getLcdTitle(count) {
  if (count === 0) return "";
  return LCD_TITLES[Math.min(count, LCD_TITLES.length - 1)];
}

function titleTier(count) {
  if (count >= 20) return "mythic";
  if (count >= 15) return "diamond";
  if (count >= 10) return "gold";
  if (count >= 5) return "silver";
  return "bronze";
}

//-------------------------------------------------------------
// MOST RECENT GCD/LCD (also detects a same-night double feature)
//-------------------------------------------------------------
function findMostRecentGcdOrLcd(entries) {
  const byMatchup = groupByMatchup(entries);
  const sortedMatchups = Object.keys(byMatchup).sort((a, b) => parseInt(b) - parseInt(a));

  for (const matchup of sortedMatchups) {
    const group = byMatchup[matchup];
    if (group.length < 3) continue;
    const date = group[0]?.date || "Unknown";

    let gcdPlayer = null, lcdPlayer = null;
    for (const p of PLAYERS) {
      const winAll = group.every(e => [e["Winning Player 1"], e["Winning Player 2"]].includes(p));
      if (winAll && !gcdPlayer) gcdPlayer = p;
      const loseAll = group.every(e => [e["Losing Player 1"], e["Losing Player 2"]].includes(p));
      if (loseAll && !lcdPlayer) lcdPlayer = p;
    }

    if (gcdPlayer || lcdPlayer) {
      const primaryType = gcdPlayer ? "gcd" : "lcd";
      return {
        type: primaryType,
        player: primaryType === "gcd" ? gcdPlayer : lcdPlayer,
        date,
        matchup,
        alsoLcd: primaryType === "gcd" ? lcdPlayer : null,
        alsoGcdPlayer: null
      };
    }
  }
  return null;
}

//=============================================================
// THE BANNER ENGINE
// Six wildly different formats, chosen deterministically from
// the Central-Time date + the achievement, so everyone sees
// the same ridiculous thing all day and a new one tomorrow.
//=============================================================
const BANNER_TEMPLATES = ["jumbotron", "gazette", "wanted", "breaking", "certificate", "movie"];

function buildBannerContext(recent, stats) {
  const isGcd = recent.type === "gcd";
  const rng = dailyRng("banner|" + recent.matchup + "|" + recent.player + "|" + recent.type);

  const headline = pick(rng, isGcd ? GCD_HEADLINES : LCD_HEADLINES);
  const epithet = pick(rng, isGcd ? GCD_EPITHETS : LCD_EPITHETS);
  const rank = pick(rng, FLOURISH_RANKS);
  const object = pick(rng, isGcd ? GCD_FLOURISH_OBJECTS : LCD_FLOURISH_OBJECTS);
  const subline = pick(rng, isGcd ? GCD_SUBLINES : LCD_SUBLINES);
  const template = BANNER_TEMPLATES[Math.floor(rng() * BANNER_TEMPLATES.length)];

  const count = isGcd ? stats[recent.player].gcds : stats[recent.player].lcds;
  const title = isGcd ? getGcdTitle(count) : getLcdTitle(count);
  const ago = daysAgo(recent.date);

  let meanwhile = null;
  if (recent.alsoLcd) {
    meanwhile = pick(rng, MEANWHILE_LCD).replace("{player}", recent.alsoLcd);
  } else if (recent.alsoGcdPlayer) {
    meanwhile = pick(rng, MEANWHILE_GCD).replace("{player}", recent.alsoGcdPlayer);
  }

  return {
    isGcd, rng, headline, epithet, subline, template, count, title,
    player: recent.player,
    nickname: `${recent.player} “${epithet}”`,
    flourish: `${rank} of ${object}`,
    date: recent.date,
    agoText: ago === null ? "" : ago === 0 ? "TODAY" : ago === 1 ? "yesterday" : `${ago} days ago`,
    meanwhile
  };
}

function tickerLine(rng, player) {
  const others = PLAYERS.filter(p => p !== player);
  const items = [];
  const used = new Set();
  while (items.length < 4 && used.size < TICKER_ITEMS.length) {
    const idx = Math.floor(rng() * TICKER_ITEMS.length);
    if (used.has(idx)) continue;
    used.add(idx);
    items.push(TICKER_ITEMS[idx].replace("{p}", others[Math.floor(rng() * others.length)].toUpperCase()));
  }
  return items.join("  ★  ");
}

const bannerRenderers = {
  //---- 1. ARENA JUMBOTRON -------------------------------------------------
  jumbotron(ctx) {
    const mood = ctx.isGcd ? "jumbo-gold" : "jumbo-red";
    const lights = Array.from({ length: 14 }, (_, i) => `<i style="animation-delay:${(i * 0.12).toFixed(2)}s"></i>`).join("");
    return `
      <div class="banner jumbotron ${mood}">
        <div class="jumbo-lights top">${lights}</div>
        <div class="jumbo-screen">
          <div class="jumbo-kicker">${ctx.isGcd ? "🏟️ TONIGHT'S HERO 🏟️" : "🏟️ TONIGHT'S VILLAIN(?) 🏟️"}</div>
          <div class="jumbo-headline">${ctx.headline}</div>
          <div class="jumbo-name">${ctx.nickname}</div>
          <div class="jumbo-flourish">${ctx.flourish}</div>
          <div class="jumbo-sub">${ctx.isGcd ? "swept all three" : "lost all three"} · ${ctx.agoText}</div>
        </div>
        <div class="jumbo-lights bottom">${lights}</div>
      </div>`;
  },

  //---- 2. TABLOID FRONT PAGE ---------------------------------------------
  gazette(ctx) {
    const fillerRng = ctx.rng;
    const f1 = pick(fillerRng, GAZETTE_FILLER);
    let f2 = pick(fillerRng, GAZETTE_FILLER);
    if (f2 === f1) f2 = GAZETTE_FILLER[(GAZETTE_FILLER.indexOf(f1) + 1) % GAZETTE_FILLER.length];
    return `
      <div class="banner gazette ${ctx.isGcd ? "gz-gold" : "gz-red"}">
        <div class="gz-masthead">The Chel Gazette</div>
        <div class="gz-dateline"><span>VOL. MMXXVI</span><span>${ctx.date}</span><span>PRICE: 1 DIGNITY</span></div>
        <div class="gz-headline">${ctx.headline}!</div>
        <div class="gz-deck">${ctx.nickname}, ${ctx.flourish}, ${ctx.isGcd ? "sweeps the night" : "swept by everyone"} — full story below</div>
        <div class="gz-body">
          <p>${ctx.subline}</p>
          <p class="gz-quote">“${ctx.isGcd ? "I'd like to see anyone stop me. Anyone. Please." : "The scoreboard is lying. Check the scoreboard."}” — ${ctx.player}</p>
        </div>
        <div class="gz-filler">
          <span>ALSO INSIDE: ${f1}</span><span>${f2}</span>
        </div>
      </div>`;
  },

  //---- 3. WANTED / BOUNTY POSTER -----------------------------------------
  wanted(ctx) {
    return `
      <div class="banner wanted ${ctx.isGcd ? "wt-bounty" : "wt-shame"}">
        <div class="wt-top">${ctx.isGcd ? "★ BOUNTY ★" : "WANTED"}</div>
        <div class="wt-sub">${ctx.isGcd ? "TOO DANGEROUS TO QUEUE AGAINST" : "FOR CRIMES AGAINST HOCKEY"}</div>
        <div class="wt-frame">
          <div class="wt-face">${ctx.isGcd ? "😤" : "🤡"}</div>
        </div>
        <div class="wt-name">${ctx.nickname}</div>
        <div class="wt-alias">alias: ${ctx.flourish}</div>
        <div class="wt-crime">${ctx.isGcd
          ? `LAST SEEN: sweeping all three games ${ctx.agoText}`
          : `CHARGES: losing all three games ${ctx.agoText}`}</div>
        <div class="wt-reward">${ctx.isGcd
          ? "REWARD FOR DEFEATING HIM: eternal bragging rights"
          : "REWARD IF FOUND PRACTICING: our respect (limited supply)"}</div>
      </div>`;
  },

  //---- 4. BREAKING NEWS ---------------------------------------------------
  breaking(ctx) {
    return `
      <div class="banner breaking ${ctx.isGcd ? "bn-gold" : "bn-red"}">
        <div class="bn-chyron"><span class="bn-live">● LIVE</span> BREAKING NEWS</div>
        <div class="bn-main">
          <div class="bn-headline">${ctx.headline}</div>
          <div class="bn-detail">${ctx.nickname} — ${ctx.flourish} — ${ctx.isGcd ? "wins ALL THREE games" : "loses ALL THREE games"} ${ctx.agoText}</div>
          <div class="bn-sub">${ctx.subline}</div>
        </div>
        <div class="bn-ticker"><div class="bn-ticker-track">${tickerLine(ctx.rng, ctx.player)}  ★  ${tickerLine(ctx.rng, ctx.player)}</div></div>
      </div>`;
  },

  //---- 5. OFFICIAL CERTIFICATE -------------------------------------------
  certificate(ctx) {
    return `
      <div class="banner certificate ${ctx.isGcd ? "cert-gold" : "cert-red"}">
        <div class="cert-border">
          <div class="cert-crest">${ctx.isGcd ? "🏆" : "🗑️"}</div>
          <div class="cert-heading">${ctx.isGcd ? "Certificate of Total Domination" : "Certificate of Participation"}</div>
          <div class="cert-presented">is hereby ${ctx.isGcd ? "awarded to" : "reluctantly issued to"}</div>
          <div class="cert-name">${ctx.nickname}</div>
          <div class="cert-flourish">${ctx.flourish}</div>
          <div class="cert-reason">for ${ctx.isGcd ? "winning" : "losing"} <b>ALL THREE GAMES</b> on ${ctx.date}</div>
          <div class="cert-sigs">
            <span class="cert-sig">The Sheet<br><i>Keeper of Records</i></span>
            <span class="cert-seal">${ctx.isGcd ? "⭐" : "💀"}</span>
            <span class="cert-sig">The Zamboni<br><i>Witness</i></span>
          </div>
        </div>
      </div>`;
  },

  //---- 6. MOVIE POSTER ----------------------------------------------------
  movie(ctx) {
    const titleWord = ctx.isGcd ? "THE SWEEP" : "THE SWEPT";
    return `
      <div class="banner movie ${ctx.isGcd ? "mv-gold" : "mv-red"}">
        <div class="mv-tagline">${ctx.isGcd ? "This season… one man cannot be stopped." : "This season… one man could not be helped."}</div>
        <div class="mv-title">${titleWord}</div>
        <div class="mv-starring">STARRING ${ctx.nickname.toUpperCase()}</div>
        <div class="mv-credits">AS “${ctx.flourish.toUpperCase()}”</div>
        <div class="mv-review">“${ctx.headline}” <span>— The Chel Gazette</span></div>
        <div class="mv-review">“${ctx.subline}” <span>— A concerned viewer</span></div>
        <div class="mv-rating">${ctx.isGcd ? "RATED S FOR SWEEP" : "RATED L FOR… WELL, YOU KNOW"} · IN THEATERS ${ctx.agoText.toUpperCase()}</div>
      </div>`;
  }
};

function renderBanner(recent, stats) {
  const container = document.getElementById("recentSpotlight");
  if (!container) return;

  if (!recent) {
    const rng = dailyRng("nobanner");
    container.innerHTML = `
      <div class="banner quiet">
        <div class="quiet-emoji">🧊</div>
        <div class="quiet-text">NO KINGS. NO CLOWNS.</div>
        <div class="quiet-sub">${pick(rng, ["The ice awaits its next hero (or victim).", "Perfect balance. Suspiciously boring.", "Someone sweep already, this is awkward."])}</div>
      </div>`;
    return;
  }

  const ctx = buildBannerContext(recent, stats);
  let html = bannerRenderers[ctx.template](ctx);

  // Title-unlock strip: every new GCD/LCD reveals a new title (until the ladder caps)
  const prevTitle = ctx.isGcd ? getGcdTitle(Math.max(0, ctx.count - 1)) : getLcdTitle(Math.max(0, ctx.count - 1));
  if (ctx.title && ctx.title !== prevTitle) {
    html += `
      <div class="title-unlock ${ctx.isGcd ? "tu-gold" : "tu-red"}">
        ${ctx.isGcd ? "🔓 TITLE UNLOCKED" : "🔒 TITLE INFLICTED"}:
        <b>“${ctx.title}”</b> (${ctx.isGcd ? "GCD" : "LCD"} #${ctx.count})
      </div>`;
  }

  if (ctx.meanwhile) {
    html += `<div class="meanwhile-strip">${ctx.meanwhile}</div>`;
  }

  container.innerHTML = html;
  container.dataset.mood = ctx.isGcd ? "gcd" : "lcd";

  // celebratory / shameful emoji rain inside the banner
  rainEmoji(container.querySelector(".banner"), ctx.isGcd ? ["👑", "✨", "🏆", "⭐"] : ["💀", "🤡", "📉", "🗑️"]);
  container.querySelector(".banner").addEventListener("click", () => {
    rainEmoji(container.querySelector(".banner"), ctx.isGcd ? ["👑", "✨", "🏆", "⭐"] : ["💀", "🤡", "📉", "🗑️"]);
  });
}

//-------------------------------------------------------------
// STANDINGS — a ranked ladder, top to bottom.
// The layout's whole job is to make the hierarchy obvious:
// big rank numbers, throne-to-rock-bottom labels, and a
// "distance to the player above you" line on every card.
//-------------------------------------------------------------
function renderStandings(stats, extras) {
  const container = document.getElementById("standings");
  if (!container) return;

  const sortedPlayers = [...PLAYERS].sort((a, b) => {
    if (stats[b].gcds !== stats[a].gcds) return stats[b].gcds - stats[a].gcds;
    if (stats[b].wins !== stats[a].wins) return stats[b].wins - stats[a].wins;
    return stats[a].lcds - stats[b].lcds;
  });

  const maxLcds = Math.max(...PLAYERS.map(p => stats[p].lcds));

  container.innerHTML = "";
  sortedPlayers.forEach((p, index) => {
    const s = stats[p];
    const x = extras[p];
    const flavor = PLAYER_FLAVOR[p] || { emoji: "🏒", color: "#94a3b8" };
    const isLeader = index === 0 && s.gcds > 0;
    const hasMaxLcds = s.lcds === maxLcds && maxLcds > 0;
    const gamesPlayed = s.wins + s.losses;
    const winPct = gamesPlayed ? Math.round((s.wins / gamesPlayed) * 100) : 0;

    const gcdTitle = getGcdTitle(s.gcds);
    const lcdTitle = getLcdTitle(s.lcds);

    // how far behind the player one rung above (ranking is GCDs → wins → fewer LCDs)
    let gapLine;
    if (index === 0) {
      gapLine = isLeader ? "🍗 top of the food chain" : "🔝 first place (on a technicality)";
    } else {
      const above = sortedPlayers[index - 1];
      const a = stats[above];
      if (a.gcds !== s.gcds) {
        const d = a.gcds - s.gcds;
        gapLine = `▲ ${d} GCD${d === 1 ? "" : "s"} behind ${above}`;
      } else if (a.wins !== s.wins) {
        const d = a.wins - s.wins;
        gapLine = `▲ tied on GCDs — ${d} win${d === 1 ? "" : "s"} behind ${above}`;
      } else {
        gapLine = `▲ dead even with ${above} — fewer LCDs breaks the tie`;
      }
    }

    const crowns = s.gcds > 0 ? "👑".repeat(Math.min(s.gcds, 10)) : "";
    const skulls = s.lcds > 0 ? "💀".repeat(Math.min(s.lcds, 10)) : "";

    const gcdAgo = x.lastGcd ? daysAgo(x.lastGcd) : null;
    const lcdAgo = x.lastLcd ? daysAgo(x.lastLcd) : null;
    const droughtBits = [];
    if (gcdAgo !== null) {
      droughtBits.push(gcdAgo > 30
        ? `😅 last GCD <b>${gcdAgo}d</b> ago (drought alert)`
        : `👑 last GCD <b>${gcdAgo === 0 ? "today" : gcdAgo + "d ago"}</b>`);
    } else if (s.gcds === 0) {
      droughtBits.push(`🚫 has literally never had a GCD`);
    }
    if (lcdAgo !== null && lcdAgo <= 14) {
      droughtBits.push(`💀 last LCD <b>${lcdAgo === 0 ? "today" : lcdAgo + "d ago"}</b> (still fresh)`);
    }
    let streakBit = "";
    if (x.streakLen >= 3) {
      streakBit = x.streakType === "W"
        ? `<span class="streak hot">🔥 ${x.streakLen}-game heater</span>`
        : `<span class="streak cold">🧊 ${x.streakLen}-game skid</span>`;
    }

    const card = document.createElement("div");
    card.className = `player-card rank-${index + 1}`
      + (isLeader ? " leader" : "")
      + (hasMaxLcds && !isLeader ? " shame" : "");
    card.style.setProperty("--player-color", flavor.color);
    card.dataset.player = p;
    card.innerHTML = `
      <div class="pc-rankcol">
        <div class="pc-ranknum">${index + 1}</div>
        <div class="pc-ranklabel">${RANK_LABELS[index] || ""}</div>
      </div>
      <div class="pc-main">
        <div class="pc-head">
          <span class="pc-emoji">${flavor.emoji}</span>
          <span class="pc-name">${p}</span>
          ${isLeader ? '<span class="pc-badge king">👑 KING</span>' : ""}
          ${hasMaxLcds && !isLeader ? '<span class="pc-badge help">🆘 needs help</span>' : ""}
          ${streakBit}
        </div>
        <div class="pc-gap">${gapLine}</div>
        <div class="pc-titles">
          ${gcdTitle ? `<span class="pc-title gcd tier-${titleTier(s.gcds)}">“${gcdTitle}”</span>` : ""}
          ${lcdTitle ? `<span class="pc-title lcd tier-${titleTier(s.lcds)}">“${lcdTitle}”</span>` : ""}
        </div>
        <div class="pc-stats">
          <div class="pc-stat gcd">
            <div class="num">${s.gcds}</div><div class="lbl">GCD</div>
            ${crowns ? `<div class="stack">${crowns}</div>` : ""}
          </div>
          <div class="pc-stat lcd">
            <div class="num">${s.lcds}</div><div class="lbl">LCD</div>
            ${skulls ? `<div class="stack">${skulls}</div>` : ""}
          </div>
          <div class="pc-stat"><div class="num">${s.wins}</div><div class="lbl">W</div></div>
          <div class="pc-stat"><div class="num">${s.losses}</div><div class="lbl">L</div></div>
        </div>
        <div class="pc-bar" title="${winPct}% win rate">
          <div class="pc-bar-fill" style="width:${winPct}%"></div>
          <span class="pc-bar-label">${winPct}% win rate</span>
        </div>
        ${droughtBits.length ? `<div class="pc-drought">${droughtBits.join(" · ")}</div>` : ""}
        <div class="pc-next" title="What's at stake">
          next GCD ⇒ “${getGcdTitle(s.gcds + 1)}” · next LCD ⇒ “${getLcdTitle(s.lcds + 1)}”
        </div>
      </div>
    `;

    // easter egg: double-tap a player card = signature emoji burst
    let taps = 0, tapTimer = null;
    card.addEventListener("click", () => {
      taps++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, 1500);
      if (taps >= 2) {
        taps = 0;
        burstEmoji(card, flavor.emoji);
      }
    });

    container.appendChild(card);
  });
}

//-------------------------------------------------------------
// RECENT SESSIONS TIMELINE
//-------------------------------------------------------------
function renderSessions(entries) {
  const container = document.getElementById("sessions");
  if (!container) return;
  const byMatchup = groupByMatchup(entries);
  const seedsDesc = Object.keys(byMatchup)
    .filter(k => byMatchup[k].length >= 3)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .slice(0, 6);

  if (!seedsDesc.length) { container.innerHTML = ""; return; }

  container.innerHTML = seedsDesc.map(seedKey => {
    const group = byMatchup[seedKey];
    const date = group[0]?.date || "?";
    const chips = PLAYERS.map(p => {
      const wins = group.filter(e => [e["Winning Player 1"], e["Winning Player 2"]].includes(p)).length;
      const losses = group.filter(e => [e["Losing Player 1"], e["Losing Player 2"]].includes(p)).length;
      const played = wins + losses;
      let cls = "";
      if (played >= 3 && wins === played) cls = "swept";
      else if (played >= 3 && wins === 0) cls = "sweptby";
      const flavor = PLAYER_FLAVOR[p] || { color: "#94a3b8" };
      return `<span class="sess-chip ${cls}" style="--player-color:${flavor.color}">
        ${p.charAt(0)} <b>${wins}-${losses}</b>${cls === "swept" ? " 👑" : cls === "sweptby" ? " 💀" : ""}
      </span>`;
    }).join("");
    const games = group.map(e => {
      const wt = e["Winning Team"] || "?";
      const w1 = e["Winning Player 1"] || "?", w2 = e["Winning Player 2"] || "";
      return `<div class="sess-game">🏒 <b>${wt}</b> <span>(${[w1, w2].filter(Boolean).join(" + ")})</span></div>`;
    }).join("");
    return `
      <details class="session">
        <summary>
          <span class="sess-date">${date}</span>
          <span class="sess-chips">${chips}</span>
        </summary>
        <div class="sess-detail">${games}</div>
      </details>`;
  }).join("");
}

//-------------------------------------------------------------
// DAILY ORACLE + TAGLINE
//-------------------------------------------------------------
function renderDailyFlavor() {
  const tagEl = document.getElementById("tagline");
  if (tagEl) tagEl.textContent = pick(dailyRng("tagline"), TAGLINES);

  const fortuneEl = document.getElementById("fortune");
  if (fortuneEl) {
    const rng = dailyRng("fortune");
    const player = pick(rng, PLAYERS);
    const text = pick(rng, FORTUNES).replace("{p}", player);
    const month = new Date().getMonth();
    fortuneEl.innerHTML = `<span class="fortune-eye">🔮</span> ${text} <span class="fortune-garnish">${MONTH_GARNISH[month] || ""}</span>`;
  }
}

//-------------------------------------------------------------
// EMOJI EFFECTS
//-------------------------------------------------------------
function rainEmoji(el, emojis, count = 18) {
  if (!el) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "rain-emoji";
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDuration = (2.5 + Math.random() * 3) + "s";
    s.style.animationDelay = (Math.random() * 2) + "s";
    s.style.fontSize = (0.8 + Math.random() * 1.2) + "rem";
    el.appendChild(s);
    setTimeout(() => s.remove(), 7000);
  }
}

function burstEmoji(el, emoji, count = 16) {
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "burst-emoji";
    s.textContent = emoji;
    s.style.left = rect.left + rect.width / 2 + "px";
    s.style.top = rect.top + rect.height / 2 + "px";
    s.style.setProperty("--dx", (Math.random() * 300 - 150) + "px");
    s.style.setProperty("--dy", (Math.random() * -250 - 50) + "px");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }
}

//-------------------------------------------------------------
// EASTER EGGS
//-------------------------------------------------------------
function initEasterEggs() {
  // Zamboni: double-tap the big title
  const title = document.getElementById("appTitle");
  let titleTaps = 0, titleTimer = null;
  title.addEventListener("click", () => {
    titleTaps++;
    clearTimeout(titleTimer);
    titleTimer = setTimeout(() => { titleTaps = 0; }, 2000);
    if (titleTaps >= 2) {
      titleTaps = 0;
      driveZamboni();
    }
  });

  // Konami code: crown rain over the whole page
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let kPos = 0;
  window.addEventListener("keydown", e => {
    kPos = (e.key === KONAMI[kPos]) ? kPos + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (kPos === KONAMI.length) {
      kPos = 0;
      document.body.classList.add("konami");
      rainEmoji(document.body, ["👑", "🏒", "🥅", "🚨"], 60);
      showToast("🕹️ KONAMI MODE: you are now legally the GCD (not really)");
      setTimeout(() => document.body.classList.remove("konami"), 8000);
    }
  });

  // Forbidden Font: double-tap the fortune
  const fortune = document.getElementById("fortune");
  let fTaps = 0, fTimer = null;
  fortune.addEventListener("click", () => {
    fTaps++;
    clearTimeout(fTimer);
    fTimer = setTimeout(() => { fTaps = 0; }, 1500);
    if (fTaps >= 2) {
      fTaps = 0;
      const on = document.body.classList.toggle("forbidden-font");
      showToast(on ? "😱 You have unlocked the Forbidden Font." : "😌 Order has been restored.");
    }
  });
}

function driveZamboni() {
  if (document.querySelector(".zamboni")) return;
  const z = document.createElement("div");
  z.className = "zamboni";
  z.innerHTML = `<span class="zamboni-body">🚜</span><span class="zamboni-trail"></span>`;
  document.body.appendChild(z);
  showToast("🧊 ZAMBONI TIME. Fresh ice for everyone.");
  setTimeout(() => z.remove(), 6000);
}

let toastTimer = null;
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}

//-------------------------------------------------------------
// COPY RESULTS (format preserved exactly — the Sheet depends on it)
//-------------------------------------------------------------
async function copyResults() {
  const seedVal = getSeed();
  const startUtc = new Date(seedVal * 3600000);
  const dateStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(startUtc);
  let rows = [];
  for (let i = 0; i < currentMatchInfo.length; i++) {
    const info = currentMatchInfo[i];
    const winnerAbbr = results[i];
    let winningTeam, losingTeam;
    let winningPlayers = [], losingPlayers = [];
    if (winnerAbbr === info.nickTeam.abbr) {
      winningTeam = info.nickTeam.name;
      losingTeam = info.otherTeam.name;
      winningPlayers = ["Nick", info.partner];
      losingPlayers = getOpposingPlayers(info.partner);
    } else if (winnerAbbr === info.otherTeam.abbr) {
      winningTeam = info.otherTeam.name;
      losingTeam = info.nickTeam.name;
      winningPlayers = getOpposingPlayers(info.partner);
      losingPlayers = ["Nick", info.partner];
    } else {
      winningTeam = "";
      losingTeam = "";
      winningPlayers = ["", ""];
      losingPlayers = ["", ""];
    }
    rows.push(`matchup\t${seedVal}`);
    rows.push(`date\t${dateStr}`);
    rows.push(`Winning Team\t${winningTeam}`);
    rows.push(`Winning Player 1\t${winningPlayers[0]}`);
    rows.push(`Winning Player 2\t${winningPlayers[1]}`);
    rows.push(`Losing Team\t${losingTeam}`);
    rows.push(`Losing Player 1\t${losingPlayers[0]}`);
    rows.push(`Losing Player 2\t${losingPlayers[1]}`);
  }
  const text = rows.join("\n");
  try {
    await navigator.clipboard.writeText(text);
    const picked = Object.keys(results).length;
    showToast(picked === currentMatchInfo.length
      ? "📋 Results copied! The Sheet awaits."
      : `📋 Copied (${picked}/${currentMatchInfo.length} winners picked — the rest are blank)`);
  } catch (err) {
    console.error("Failed to copy results to clipboard", err);
    showToast("⚠️ Couldn't copy to clipboard");
  }
  window.open(SHEET_URL, "_blank");
}

//-------------------------------------------------------------
// SPECIAL SEED CHECK — exact matches win, then meme suffixes
//-------------------------------------------------------------
function checkSpecialSeed(seed) {
  const s = String(seed);
  let msg = SPECIAL_SEEDS[s];
  if (!msg) {
    if (s.endsWith("420")) msg = SEED_SUFFIX_MESSAGES["420"];
    else if (s.endsWith("69")) msg = SEED_SUFFIX_MESSAGES["69"];
    else if (s.endsWith("67")) msg = SEED_SUFFIX_MESSAGES["67"];
  }
  if (msg) showToast(msg);
}

//-------------------------------------------------------------
// INIT
//-------------------------------------------------------------
async function init() {
  renderDailyFlavor();
  initEasterEggs();

  try {
    if (ENABLE_LIVE_STATS) {
      teams = await fetchLiveTeamStatsViaProxy();
    } else {
      throw new Error("Live stats disabled, using fallback");
    }
  } catch (err) {
    console.warn("Using fallback team data:", err.message);
    teams = FALLBACK_TEAMS.slice();
  }
  teams = teams.filter(t => !BANNED_ABBRS.includes(t.abbr));

  const seedInput = document.getElementById("seedInput");
  const initialSeed = getSeed();
  seedInput.placeholder = initialSeed;

  function rerender(seed, opts = {}) {
    renderMatchups(generateMatchups(seed), seed, { mirror: false, ...opts });
    checkSpecialSeed(seed);
  }

  document.getElementById("generateBtn").addEventListener("click", () => rerender(getSeed()));

  document.getElementById("rerollBtn").addEventListener("click", () => {
    const next = getSeed() + 1;
    seedInput.value = next;
    rerender(next);
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    const prev = getSeed() - 1;
    seedInput.value = prev;
    rerender(prev);
  });

  document.getElementById("nowBtn").addEventListener("click", () => {
    seedInput.value = "";
    rerender(getSeed());
  });

  document.getElementById("mirrorBtn").addEventListener("click", () => {
    const seedForMirror = lastSeed ?? getSeed();
    const matchupsForMirror = lastMatchups.length ? lastMatchups : generateMatchups(seedForMirror);
    const partnersForMirror = lastPartners.length ? lastPartners : assignPartners(seedForMirror, matchupsForMirror.length);
    renderMatchups(matchupsForMirror, seedForMirror, {
      mirror: !lastMirror,
      partners: partnersForMirror
    });
  });

  document.getElementById("copyResultsBtn").addEventListener("click", copyResults);

  rerender(initialSeed);

  try {
    const saved = await loadResults();
    const stats = computeScoreboard(saved);
    const extras = computeExtras(saved);
    renderStandings(stats, extras);
    renderSessions(saved);
    const recent = findMostRecentGcdOrLcd(saved);
    renderBanner(recent, stats);
  } catch (err) {
    console.warn("Could not compute scoreboard", err.message);
  }
}

window.addEventListener("DOMContentLoaded", init);
