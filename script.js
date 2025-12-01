//-------------------------------------------------------------
// CONFIG
//-------------------------------------------------------------
const ENABLE_LIVE_STATS = true; 
// ^ Set to true to always try loading teams.json from your static host.
//   Later, you can switch to a backend proxy by setting this to true
//   and updating fetchTeamStats() to hit your proxy URL.

const BANNED_ABBRS = ["TBL", "COL"]; // Lightning, Avalanche
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
// 3. RATING CALCULATION
//-------------------------------------------------------------
function computeRatings(list) {
  const gfList = list.map(t => Number(t.gf));
  const gaList = list.map(t => Number(t.ga));
  const maxGF = Math.max(...gfList);
  const minGF = Math.min(...gfList);
  const maxGA = Math.max(...gaList);
  const minGA = Math.min(...gaList);

  return list.map(t => {
    const gfNorm = (t.gf - minGF) / (maxGF - minGF || 1);
    const gaNorm = (maxGA - t.ga) / (maxGA - minGA || 1);
    const rating = gfNorm * 0.6 + gaNorm * 0.4;
    return { ...t, rating };
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
//    • Top 50% as anchors
//    • Filter same-color opponents
//    • Pick random from 5 nearest by rating
//-------------------------------------------------------------
function generateMatchups(seed) {
  const ratedAll = computeRatings(
    teams.filter(t => !BANNED_ABBRS.includes(t.abbr))
  );

  // Sort by rating desc
  const sorted = ratedAll.slice().sort((a, b) => b.rating - a.rating);
  const half = Math.floor(sorted.length / 2);
  const topHalf = sorted.slice(0, half);

  const rng = createLCG(seed);

  // Shuffle topHalf for anchor selection
  const anchors = [...topHalf];
  for (let i = anchors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [anchors[i], anchors[j]] = [anchors[j], anchors[i]];
  }

  const selectedAnchors = anchors.slice(0, 3);
  const matchups = [];

  for (const anchor of selectedAnchors) {
    const candidates = ratedAll
      .filter(t => t.abbr !== anchor.abbr)
      .filter(t => t.color !== anchor.color)
      .sort(
        (a, b) =>
          Math.abs(a.rating - anchor.rating) -
          Math.abs(b.rating - anchor.rating)
      );

    const nearest = candidates.slice(0, Math.min(5, candidates.length));
    const opp = nearest[Math.floor(rng() * nearest.length)];

    if (opp) {
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

function assignPartners(seed, count) {
  // Use a mixed seed so nearby seeds produce different shuffles
  const rng = createLCG(mixSeed(seed + 1337));

  // Deterministically shuffle PARTNERS with the seeded RNG (Fisher-Yates)
  const pool = [...PARTNERS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // If count > pool.length, wrap around in the shuffled order
  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push(pool[i % pool.length]);
  }
  return picks;
}

function renderMatchups(matchups, seed) {
  const container = document.getElementById("matchups");
  container.innerHTML = "";

  const partners = assignPartners(seed, matchups.length);

  matchups.forEach((pair, index) => {
    const [t1, t2] = pair;
    const nickTeam = t1.rating >= t2.rating ? t1 : t2;
    const otherTeam = nickTeam === t1 ? t2 : t1;
    const partner = partners[index];

    const wrapper = document.createElement("div");
    const heading = document.createElement("h2");
    heading.className = "text-2xl font-semibold mb-3";
    heading.textContent = `Game ${index + 1}`;

    const row = document.createElement("div");
    row.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch";

    row.appendChild(createTeamCard(nickTeam, true, partner));
    row.appendChild(createTeamCard(otherTeam, false, null));

    wrapper.appendChild(heading);
    wrapper.appendChild(row);
    container.appendChild(wrapper);
  });
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

  document.getElementById("generateBtn").addEventListener("click", () => {
    const s = getSeed();
    renderMatchups(generateMatchups(s), s);
  });

  document.getElementById("rerollBtn").addEventListener("click", () => {
    const current = getSeed();
    const next = current + 1;
    seedInput.value = next;
    renderMatchups(generateMatchups(next), next);
  });

  // initial render
  renderMatchups(generateMatchups(initialSeed), initialSeed);
}

window.addEventListener("DOMContentLoaded", init);
