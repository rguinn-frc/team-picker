//-------------------------------------------------------------
// CONFIG
//-------------------------------------------------------------
const ENABLE_LIVE_STATS = true; 
// ^ Set to true to always try loading teams.json from your static host.
//   Later, you can switch to a backend proxy by setting this to true
//   and updating fetchTeamStats() to hit your proxy URL.

const BANNED_ABBRS = ["TBL", "COL", "EDM", "WPG"]; // Lightning, Avalanche, Oilers, Jets
const PARTNERS = ["Ryan", "Tom", "Dylan"]; // Nick's possible partners

//-------------------------------------------------------------
// TEAM COLORS (for avoiding color clashes)
//-------------------------------------------------------------
const TEAM_COLORS = {
  ANA: "orange",
  ARI: "red",
  BOS: "yellow",
  BUF: "blue",
  CGY: "red",
  CAR: "red",
  CHI: "red",
  COL: "burgundy",
  CBJ: "blue",
  DAL: "green",
  DET: "red",
  EDM: "orange",
  FLA: "red",
  LAK: "black",
  MIN: "green",
  MTL: "red",
  NSH: "yellow",
  NJD: "red",
  NYI: "blue",
  NYR: "blue",
  OTT: "red",
  PHI: "orange",
  PIT: "yellow",
  SJS: "teal",
  SEA: "teal",
  STL: "blue",
  TBL: "blue",
  TOR: "blue",
  VAN: "blue",
  VGK: "gold",
  WSH: "red",
  WPG: "blue",
  UTA: "blue" // Utah Mammoth
};

// Filled at runtime
let teams = [];

// Global object to hold the selected winner for each matchup (keyed by game index)
// Reset whenever new matchups are generated.
let results = {};

// Names of human players used throughout the app
const PLAYERS = ["Tom", "Ryan", "Nick", "Dylan"];

function getOpposingPlayers(nickPartner) {
  // the 2 humans not playing as Nick+partner
  return PLAYERS.filter(p => p !== "Nick" && p !== nickPartner);
}

// Store meta information about the currently rendered matchups. Each element
// contains { nickTeam, otherTeam, partner } for the corresponding game index.
let currentMatchInfo = [];
let lastSeed = null;
let lastMatchups = [];
let lastPartners = [];
let lastMirror = false;

//-------------------------------------------------------------
// 1. FALLBACK LOCAL TEAM DATA
//    (rough static snapshot; tweak as you like)
//-------------------------------------------------------------
const FALLBACK_TEAMS = [
  { name: 'Colorado Avalanche',      abbr: 'COL', pts: 37, gf: 4.00, ga: 2.18, color: 'burgundy' },
  { name: 'Carolina Hurricanes',     abbr: 'CAR', pts: 30, gf: 3.50, ga: 2.91, color: 'red' },
  { name: 'Dallas Stars',            abbr: 'DAL', pts: 30, gf: 3.18, ga: 2.73, color: 'green' },
  { name: 'Anaheim Ducks',           abbr: 'ANA', pts: 29, gf: 3.59, ga: 3.14, color: 'orange' },
  { name: 'New Jersey Devils',       abbr: 'NJD', pts: 29, gf: 3.05, ga: 3.05, color: 'red' },
  { name: 'Tampa Bay Lightning',     abbr: 'TBL', pts: 28, gf: 3.14, ga: 2.73, color: 'blue' },
  { name: 'Seattle Kraken',          abbr: 'SEA', pts: 28, gf: 2.59, ga: 2.55, color: 'teal' },
  { name: 'Los Angeles Kings',       abbr: 'LAK', pts: 28, gf: 2.65, ga: 2.61, color: 'black' },
  { name: 'Minnesota Wild',          abbr: 'MIN', pts: 28, gf: 2.87, ga: 2.78, color: 'green' },
  { name: 'New York Islanders',      abbr: 'NYI', pts: 28, gf: 3.04, ga: 2.78, color: 'blue' },
  { name: 'Vegas Golden Knights',    abbr: 'VGK', pts: 27, gf: 3.09, ga: 2.91, color: 'gold' },
  { name: 'Utah Mammoth',            abbr: 'UTA', pts: 27, gf: 3.09, ga: 2.96, color: 'blue' },
  { name: 'Detroit Red Wings',       abbr: 'DET', pts: 27, gf: 2.91, ga: 3.22, color: 'red' },
  { name: 'Boston Bruins',           abbr: 'BOS', pts: 26, gf: 3.08, ga: 3.21, color: 'yellow' },
  { name: 'Washington Capitals',     abbr: 'WSH', pts: 26, gf: 3.30, ga: 2.65, color: 'red' },
  { name: 'Ottawa Senators',         abbr: 'OTT', pts: 26, gf: 3.14, ga: 3.23, color: 'red' },
  { name: 'Montreal Canadiens',      abbr: 'MTL', pts: 25, gf: 3.43, ga: 3.52, color: 'red' },
  { name: 'Florida Panthers',        abbr: 'FLA', pts: 25, gf: 3.14, ga: 3.05, color: 'red' },
  { name: 'Philadelphia Flyers',     abbr: 'PHI', pts: 25, gf: 2.67, ga: 2.81, color: 'orange' },
  { name: 'Pittsburgh Penguins',     abbr: 'PIT', pts: 25, gf: 3.05, ga: 2.62, color: 'yellow' },
  { name: 'Edmonton Oilers',         abbr: 'EDM', pts: 25, gf: 3.08, ga: 3.54, color: 'blue' },
  { name: 'San Jose Sharks',         abbr: 'SJS', pts: 25, gf: 2.91, ga: 3.09, color: 'teal' },
  { name: 'Columbus Blue Jackets',   abbr: 'CBJ', pts: 25, gf: 2.87, ga: 3.26, color: 'blue' },
  { name: 'New York Rangers',        abbr: 'NYR', pts: 24, gf: 2.50, ga: 2.63, color: 'blue' },
  { name: 'Chicago Blackhawks',      abbr: 'CHI', pts: 24, gf: 3.14, ga: 2.77, color: 'red' },
  { name: 'Winnipeg Jets',           abbr: 'WPG', pts: 24, gf: 3.14, ga: 2.81, color: 'blue' },
  { name: 'Buffalo Sabres',          abbr: 'BUF', pts: 22, gf: 3.18, ga: 3.41, color: 'blue' },
  { name: 'Toronto Maple Leafs',     abbr: 'TOR', pts: 21, gf: 3.36, ga: 3.73, color: 'blue' },
  { name: 'St. Louis Blues',         abbr: 'STL', pts: 20, gf: 2.65, ga: 3.61, color: 'blue' },
  { name: 'Vancouver Canucks',       abbr: 'VAN', pts: 20, gf: 3.00, ga: 3.74, color: 'blue' },
  { name: 'Calgary Flames',          abbr: 'CGY', pts: 19, gf: 2.38, ga: 2.96, color: 'red' },
  { name: 'Nashville Predators',     abbr: 'NSH', pts: 16, gf: 2.32, ga: 3.68, color: 'yellow' }
];

//-------------------------------------------------------------
// 2. LIVE STATS FROM STATIC JSON (same-origin)
//-------------------------------------------------------------
async function fetchLiveTeamStatsViaProxy() {
  // Fetch teams.json that the GitHub Action publishes to the repo root.
  const resp = await fetch("teams.json", { cache: "no-cache" });
  if (!resp.ok) {
    throw new Error("teams.json fetch failed: " + resp.status);
  }
  const data = await resp.json();
  // Expect data: [{ name, abbr, pts, gf, ga }]
  return data.map(t => ({
    ...t,
    color: TEAM_COLORS[t.abbr] || "unknown"
  }));
}

//-------------------------------------------------------------
// 3. RATING CALCULATION (Points per Game)
//-------------------------------------------------------------
function computeRatings(list) {
  return list.map(t => {
    // Prefer an explicit games played field; otherwise estimate to avoid over-weighting totals
    const gpRaw = Number(t.gp || t.gamesPlayed);
    const estimatedGP = Math.max(1, Math.round(Number(t.pts || 0) / 2));
    const gp = Number.isFinite(gpRaw) && gpRaw > 0 ? gpRaw : estimatedGP;
    const ppg = gp > 0 ? Number(t.pts || 0) / gp : 0;
    return { ...t, gp, ppg, rating: ppg };
  });
}

//-------------------------------------------------------------
// 4. SEEDED RNG (LCG)
//-------------------------------------------------------------
function createLCG(seed) {
  const m = 2147483647;
  const a = 16807;
  let state = seed % m;
  return () => {
    state = (state * a) % m;
    return state / m;
  };
}

//-------------------------------------------------------------
// 5. MATCHUP GENERATOR
//    • Top 75% as anchors
//    • Filter same-color opponents
//    • Pick random from 8 nearest by rating
//-------------------------------------------------------------
function generateMatchups(seed) {
  const ratedAll = computeRatings(
    teams.filter(t => !BANNED_ABBRS.includes(t.abbr))
  );

  // Sort by rating desc
  const sorted = ratedAll.slice().sort((a, b) => b.rating - a.rating);
  const poolCount = Math.max(1, Math.round(sorted.length * 0.75));
  const topHalf = sorted.slice(0, poolCount);

  const rng = createLCG(seed);

  // Shuffle topHalf for anchor selection
  const anchors = [...topHalf];
  for (let i = anchors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [anchors[i], anchors[j]] = [anchors[j], anchors[i]];
  }

  const selectedAnchors = anchors.slice(0, 3);
  const matchups = [];
  const usedAbbrs = new Set();

  for (const anchor of selectedAnchors) {
    if (usedAbbrs.has(anchor.abbr)) continue;
    usedAbbrs.add(anchor.abbr);

    const candidates = ratedAll
      .filter(t => t.abbr !== anchor.abbr)
      .filter(t => t.color !== anchor.color)
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

//-------------------------------------------------------------
// 6. RENDERING
//-------------------------------------------------------------
function createTeamCard(team, isNick, partner) {
  const logoUrl = `https://assets.nhle.com/logos/nhl/svg/${team.abbr}_dark.svg`;

  const card = document.createElement("div");
  card.className =
    "flex flex-col items-center border rounded-lg p-4 w-full sm:w-1/2 " +
    (isNick ? "border-yellow-500" : "border-gray-700");

  const partnerBadge = isNick
    ? `<span class="mt-3 px-2 py-1 bg-yellow-500 text-black text-xs rounded">
         Nick${partner ? " + " + partner : ""} gets this team
       </span>`
    : "";

  card.innerHTML = `
    <img src="${logoUrl}" alt="${team.name} logo"
         class="w-20 h-20 mb-2" onerror="this.style.display='none'">
    <h3 class="text-xl font-bold mb-1 text-center">${team.name}</h3>
    <div class="text-sm text-gray-300 flex flex-col items-center space-y-1">
      <span><strong>PTS/G:</strong> ${(team.ppg ?? 0).toFixed(2)}</span>
      <span><strong>PTS:</strong> ${team.pts}</span>
      <span><strong>GF/G:</strong> ${team.gf.toFixed(2)}</span>
      <span><strong>GA/G:</strong> ${team.ga.toFixed(2)}</span>
    </div>
    ${partnerBadge}
  `;
  return card;
}

// mix the integer seed to reduce correlation between adjacent seeds
function mixSeed(seed) {
  // 32-bit unsigned mix: xor with golden ratio, multiply, add constant
  return (Math.imul(seed ^ 0x9e3779b1, 1664525) + 1013904223) >>> 0;
}

function jitterSeed(seed) {
  // xorshift-style scramble to make adjacent seeds diverge quickly
  let x = seed >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  x = (x + 0x9e3779b9) >>> 0;
  return x;
}

function assignPartners(seed, count) {
  // Mix and jitter the seed to make adjacent seeds more erratic
  const mixed = mixSeed(seed + 1337);
  const jittered = jitterSeed(seed * 3 + 7) ^ jitterSeed(seed ^ 0x5bd1e995);
  const rng = createLCG((mixed ^ jittered) >>> 0);

  // Deterministically shuffle PARTNERS with the seeded RNG (Fisher-Yates)
  const pool = [...PARTNERS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Apply a random rotation to further decorrelate adjacent seeds
  const rotateBy = Math.floor(rng() * pool.length) % pool.length;
  const rotated = pool.slice(rotateBy).concat(pool.slice(0, rotateBy));

  // If count > pool.length, wrap around in the shuffled order
  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push(rotated[i % rotated.length]);
  }
  return picks;
}

function renderMatchups(matchups, seed, options = {}) {
  const { mirror = false, partners: partnersOverride } = options;
  const container = document.getElementById("matchups");
  container.innerHTML = "";

  // Reset results since we're rendering fresh matchups
  results = {};
  currentMatchInfo = [];

  // Update the hour range display based on the provided seed
  updateHourRangeDisplay(seed);

  const partners = partnersOverride || assignPartners(seed, matchups.length);

  matchups.forEach((pair, index) => {
    const [t1, t2] = pair;
    // Determine which team should be assigned to Nick (higher rating)
    const baseNickTeam = t1.rating >= t2.rating ? t1 : t2;
    const baseOtherTeam = baseNickTeam === t1 ? t2 : t1;
    const nickTeam = mirror ? baseOtherTeam : baseNickTeam;
    const otherTeam = mirror ? baseNickTeam : baseOtherTeam;
    const partner = partners[index];

    // Store info for later (for copy/clipboard and scoreboard)
    currentMatchInfo[index] = { nickTeam, otherTeam, partner };

    const wrapper = document.createElement("div");
    const heading = document.createElement("h2");
    heading.className = "text-2xl font-semibold mb-3";
    heading.textContent = `Game ${index + 1}`;

    const row = document.createElement("div");
    row.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch";

    // Create team cards
    const card1 = createTeamCard(nickTeam, true, partner);
    const card2 = createTeamCard(otherTeam, false, null);
    // Mark cards as interactive
    [card1, card2].forEach(card => {
      card.classList.add("cursor-pointer", "hover:shadow-lg");
    });
    // Assign dataset attributes so we can highlight selected winners later
    card1.dataset.gameIndex = index;
    card1.dataset.teamAbbr = nickTeam.abbr;
    card2.dataset.gameIndex = index;
    card2.dataset.teamAbbr = otherTeam.abbr;
    // Click handler: selecting this card as the winner
    function handleCardClick(selectedCard, team) {
      return () => {
        // Record the winning team abbr for this game index
        results[index] = team.abbr;
        // Remove highlights from both cards
        [card1, card2].forEach(card => {
          card.classList.remove("ring", "ring-4", "ring-green-500");
        });
        // Add highlight to the selected card
        selectedCard.classList.add("ring", "ring-4", "ring-green-500");
      };
    }
    card1.addEventListener("click", handleCardClick(card1, nickTeam));
    card2.addEventListener("click", handleCardClick(card2, otherTeam));
    row.appendChild(card1);
    row.appendChild(card2);
    wrapper.appendChild(heading);
    wrapper.appendChild(row);
    container.appendChild(wrapper);
  });

  lastSeed = seed;
  lastMatchups = matchups;
  lastPartners = partners;
  lastMirror = mirror;
  const mirrorBtn = document.getElementById("mirrorBtn");
  if (mirrorBtn) {
    mirrorBtn.textContent = mirror ? "Unmirror Matchups" : "Mirror Matchups";
  }
}

//-------------------------------------------------------------
// 7. SEED HANDLING
//-------------------------------------------------------------
function getSeed() {
  const input = document.getElementById("seedInput").value;
  if (input) {
    const parsed = parseInt(input, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  // default: current hour
  return Math.floor(Date.now() / 3600000);
}

//-------------------------------------------------------------
// 9. HOUR RANGE DISPLAY
//-------------------------------------------------------------
/**
 * Compute and display the one‑hour range (Central Time) associated with a seed.
 *
 * The seed represents the number of hours since the UNIX epoch. We interpret
 * it as the start of the hour in UTC, then convert to America/Chicago
 * (Central Time) for display. The display will show the start and end of
 * the hour (e.g., "Dec 15, 2025 3:00 PM – 4:00 PM CT").
 *
 * @param {number} seed
 */
function updateHourRangeDisplay(seed) {
  const displayEl = document.getElementById("hourRangeDisplay");
  if (!displayEl) return;
  // Derive start and end times in UTC based on the seed (hours since epoch)
  const startUtc = new Date(seed * 3600000);
  const endUtc = new Date((seed + 1) * 3600000);
  // Format options for Central Time
  const opts = {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  };
  const fmt = new Intl.DateTimeFormat("en-US", opts);
  const startStr = fmt.format(startUtc);
  const endStrTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(endUtc);
  displayEl.textContent = `Current Seed: ${seed} → Central Time range: ${startStr} – ${endStrTime} CT`;
}

//-------------------------------------------------------------
// 10. RESULTS AND SCOREBOARD
//-------------------------------------------------------------
/**
 * Fetch the saved match results from results.json. Returns an empty array
 * if the file cannot be loaded.
 * @returns {Promise<Array<Object>>}
 */
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

/**
 * Compute cumulative statistics (wins, losses, GCDs, LCDs) for the human players
 * based on the loaded results. Results are grouped by matchup to determine
 * GCD/LCD (winning or losing all three games within a seed).
 * @param {Array<Object>} entries
 * @returns {Object<string, {wins:number, losses:number, gcds:number, lcds:number}>}
 */
function computeScoreboard(entries) {
  const stats = {};
  PLAYERS.forEach(p => {
    stats[p] = { wins: 0, losses: 0, gcds: 0, lcds: 0 };
  });
  // Count wins and losses per entry
  entries.forEach(entry => {
    const winners = [entry["Winning Player 1"], entry["Winning Player 2"]].filter(Boolean);
    const losers = [entry["Losing Player 1"], entry["Losing Player 2"]].filter(Boolean);
    PLAYERS.forEach(p => {
      if (winners.includes(p)) stats[p].wins += 1;
      if (losers.includes(p)) stats[p].losses += 1;
    });
  });
  // Group by matchup (seed) to compute GCD/LCD
  const byMatchup = {};
  entries.forEach(entry => {
    const m = entry.matchup;
    if (!byMatchup[m]) byMatchup[m] = [];
    byMatchup[m].push(entry);
  });
  Object.values(byMatchup).forEach(group => {
    // Expect groups of length 3 (3 games per seed) but handle arbitrary lengths
    PLAYERS.forEach(p => {
      // All wins across all games in this matchup
      const winAll = group.length > 0 && group.every(e => {
        const winners = [e["Winning Player 1"], e["Winning Player 2"]];
        return winners.includes(p);
      });
      if (winAll && group.length >= 3) stats[p].gcds += 1;
      // All losses across all games
      const loseAll = group.length > 0 && group.every(e => {
        const losers = [e["Losing Player 1"], e["Losing Player 2"]];
        return losers.includes(p);
      });
      if (loseAll && group.length >= 3) stats[p].lcds += 1;
    });
  });
  return stats;
}

/**
 * Render the scoreboard table using the computed stats.
 * @param {Object} stats
 */
function renderScoreboard(stats) {
  const tbody = document.querySelector("#scoreboard tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  PLAYERS.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-4 py-2">${p}</td>
      <td class="px-4 py-2">${stats[p].gcds}</td>
      <td class="px-4 py-2">${stats[p].lcds}</td>
      <td class="px-4 py-2">${stats[p].wins}</td>
      <td class="px-4 py-2">${stats[p].losses}</td>
    `;
    tbody.appendChild(row);
  });
}

//-------------------------------------------------------------
// 8. INIT
//-------------------------------------------------------------
async function init() {
  try {
    if (ENABLE_LIVE_STATS) {
      const live = await fetchLiveTeamStatsViaProxy();
      teams = live;
    } else {
      throw new Error("Live stats disabled, using fallback");
    }
  } catch (err) {
    console.warn("Using fallback team data:", err.message);
    teams = FALLBACK_TEAMS.slice();
  }

  // Filter banned
  teams = teams.filter(t => !BANNED_ABBRS.includes(t.abbr));

  const seedInput = document.getElementById("seedInput");
  const initialSeed = getSeed();
  seedInput.placeholder = initialSeed;

  // Initial hour range display
  updateHourRangeDisplay(initialSeed);

  document.getElementById("generateBtn").addEventListener("click", () => {
    const s = getSeed();
    renderMatchups(generateMatchups(s), s, { mirror: false });
    updateHourRangeDisplay(s);
  });

  document.getElementById("rerollBtn").addEventListener("click", () => {
    const current = getSeed();
    const next = current + 1;
    seedInput.value = next;
    renderMatchups(generateMatchups(next), next, { mirror: false });
    updateHourRangeDisplay(next);
  });

  // Decrement seed by one when clicking the back button
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const current = getSeed();
      const prev = current - 1;
      seedInput.value = prev;
      renderMatchups(generateMatchups(prev), prev, { mirror: false });
      updateHourRangeDisplay(prev);
    });
  }

  // Mirror button swaps Nick's assignment with the other team for all games
  const mirrorBtn = document.getElementById("mirrorBtn");
  if (mirrorBtn) {
    mirrorBtn.addEventListener("click", () => {
      const seedForMirror = lastSeed ?? getSeed();
      const matchupsForMirror = lastMatchups.length
        ? lastMatchups
        : generateMatchups(seedForMirror);
      const partnersForMirror = lastPartners.length
        ? lastPartners
        : assignPartners(seedForMirror, matchupsForMirror.length);
      renderMatchups(matchupsForMirror, seedForMirror, {
        mirror: !lastMirror,
        partners: partnersForMirror
      });
    });
  }

  // Copy results to clipboard and open Google Sheet (placeholder)
  const copyBtn = document.getElementById("copyResultsBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      // For each game, build a set of label-value pairs. The first column is the label, the second is the value.
      const seedVal = getSeed();
      // Compute the date string in Central Time (America/Chicago) for the current seed
      const startUtc = new Date(seedVal * 3600000);
      const dateStr = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(startUtc);
      let rows = [];
      for (let i = 0; i < currentMatchInfo.length; i++) {
        const info = currentMatchInfo[i];
        const winnerAbbr = results[i];
        // Determine winning and losing teams and players
        let winningTeam, losingTeam;
        let winningPlayers = [], losingPlayers = [];
        if (winnerAbbr === info.nickTeam.abbr) {
          winningTeam = info.nickTeam.name;
          losingTeam = info.otherTeam.name;
          winningPlayers = ["Nick", info.partner];
          // CPU assumed for losing team
          losingPlayers = getOpposingPlayers(info.partner);
        } else if (winnerAbbr === info.otherTeam.abbr) {
          winningTeam = info.otherTeam.name;
          losingTeam = info.nickTeam.name;
          winningPlayers = getOpposingPlayers(info.partner);
          losingPlayers = ["Nick", info.partner];
        } else {
          // if no winner selected, leave fields blank
          winningTeam = "";
          losingTeam = "";
          winningPlayers = ["", ""];
          losingPlayers = ["", ""];
        }
        // Append the rows for this game. Use tab separators.
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
      } catch (err) {
        console.error("Failed to copy results to clipboard", err);
      }
      const placeholderUrl = "https://docs.google.com/spreadsheets/d/1ZS1sG6XIYgm1bOeSSqkQ8kQRUQyzImOlMWao6Nk0YLw/edit";
      window.open(placeholderUrl, "_blank");
    });
  }

  // initial render
  renderMatchups(generateMatchups(initialSeed), initialSeed, { mirror: false });

  // Load saved results and display the scoreboard
  try {
    const saved = await loadResults();
    const stats = computeScoreboard(saved);
    renderScoreboard(stats);
  } catch (err) {
    console.warn("Could not compute scoreboard", err.message);
  }
}

window.addEventListener("DOMContentLoaded", init);
