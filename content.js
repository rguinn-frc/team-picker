//=============================================================
// CONTENT.JS — The Vibes Department
// All the phrases, titles, epithets, fortunes and nonsense.
// Add lines freely; everything is picked deterministically
// from the day seed so everyone sees the same chaos.
//=============================================================

//-------------------------------------------------------------
// PLAYER FLAVOR
//-------------------------------------------------------------
const PLAYER_FLAVOR = {
  Tom:   { emoji: "🦬", color: "#34d399" },
  Ryan:  { emoji: "🌶️", color: "#f472b6" },
  Nick:  { emoji: "🎯", color: "#38bdf8" },
  Dylan: { emoji: "🦈", color: "#a78bfa" }
};

//-------------------------------------------------------------
// DAILY TAGLINES (under the app title)
//-------------------------------------------------------------
const TAGLINES = [
  "The premier destination for synchronized shame",
  "Where friendships go to be tested",
  "Certified fair and balanced (the teams, not the trash talk)",
  "Four men enter. One man sweeps. One man weeps.",
  "Powered by spite and a Google Sheet",
  "No refs. No mercy. No database.",
  "Statistically significant bullying since 2025",
  "The only standings table that matters",
  "Home of the three-game character assassination",
  "It's not gambling if the currency is dignity",
  "Peer-reviewed matchmaking. Peer-ridiculed results.",
  "All matchups final. All excuses ignored.",
  "A hockey experience. An emotional ordeal.",
  "Chel: because therapy is expensive",
  "One seed to rule them all",
  "The Sheet remembers everything",
  "Tonight, someone becomes a cautionary tale",
  "Skill issues, quantified daily",
  "Now with 100% more public accountability",
  "Handcrafted matchups. Machine-crafted mockery.",
  "Premium edition sold separately (Tom already bought it)",
  "One session only. Dylan's rules.",
  "Please pause the football game before puck drop",
  "Featuring the self-proclaimed best player in the group",
  "Run it back? (Dylan has left the chat)",
  "Not pay-to-win. Allegedly.",
  "Lucky bounces not included (Ryan checked)"
];

//-------------------------------------------------------------
// TITLES — index = number of GCDs / LCDs earned.
// First 19 preserved from the classic era; new tiers beyond.
//-------------------------------------------------------------
const GCD_TITLES = [
  "", // 0
  "Rising Star", // 1
  "Certified Gamer", // 2
  "Absolute Unit", // 3
  "Hockey Deity", // 4
  "Living Legend", // 5
  "Unstoppable", // 6
  "Matchday Maestro", // 7
  "Clutch Specialist", // 8
  "Goal Whisperer", // 9
  "Prime Time Player", // 10
  "Arena Conqueror", // 11
  "Stat Sheet Stuffer", // 12
  "Tilt Inducer", // 13
  "Frostbite Finisher", // 14
  "No-Mercy MVP", // 15
  "Perfectionist", // 16
  "Dominance Incarnate", // 17
  "God Mode Engaged", // 18
  "Hockey Immortal", // 19
  "The Algorithm Fears Him", // 20
  "Banned in Three Provinces", // 21
  "Final Boss of the Basement", // 22
  "The Reason We Nerf Things", // 23
  "Undisputed Couch Heavyweight", // 24
  "Grand Wizard of the Crease", // 25
  "The House Always Wins (He Is the House)", // 26
  "Chosen One of the Sheet", // 27
  "Peak Performance Personified", // 28
  "Mythic Rank: Untouchable", // 29
  "THE ELDRITCH SWEEP LORD" // 30+
];

const LCD_TITLES = [
  "", // 0
  "Participation Trophy Holder", // 1
  "Professional Button Masher", // 2
  "The Human Zamboni", // 3
  "Ice Cold (in a bad way)", // 4
  "Lord of the Ls", // 5
  "Benchwarmer Extraordinaire", // 6
  "Perpetual Underdog", // 7
  "Glorious Gulper of Goals", // 8
  "Stat-Sink Specialist", // 9
  "Hard Mode Enthusiast", // 10
  "Rebuild Project", // 11
  "Try-Harder", // 12
  "Comedy Relief", // 13
  "Dumpster Diver", // 14
  "Lost in the Boxscore", // 15
  "Tactical Mystery", // 16
  "Serial Sacrifice", // 17
  "Exhibit A", // 18
  "Lord of Misery", // 19
  "The Control Group", // 20
  "Certified Cone Collector", // 21
  "Emotional Support Opponent", // 22
  "The League's Charity Program", // 23
  "Walking Tutorial Level", // 24
  "Patron Saint of the Empty Net", // 25
  "Living Proof Anyone Can Play", // 26
  "The Sheet's Favorite Punchline", // 27
  "Museum-Grade Futility", // 28
  "Mythic Rank: Unwatchable", // 29
  "THE ETERNAL VOID OF Ls" // 30+
];

//-------------------------------------------------------------
// HEADLINES — big text for the daily banner
//-------------------------------------------------------------
const GCD_HEADLINES = [
  "ALL HAIL THE CHAMPION",
  "ABSOLUTE DOMINATION",
  "UNSTOPPABLE FORCE",
  "GAMING GOD ALERT",
  "THEY JUST BUILT DIFFERENT",
  "SLAYING THE ICE",
  "ERUPTION OF GREATNESS",
  "BLASTOFF TO GLORY",
  "CLUTCH, CLEAN, COMPLETE",
  "OPPONENTS OBLITERATED",
  "CHAMPAGNE BEHAVIOR",
  "CROWN-WORTHY DISPLAY",
  "LEGENDARY NIGHT OUT",
  "ELECTRIFYING SWEEP",
  "A MASTERCLASS IN VIOLENCE (HOCKEY VIOLENCE)",
  "THE BROOM HAS BEEN DEPLOYED",
  "PERFECTION ACHIEVED, WITNESSES TRAUMATIZED",
  "THREE GAMES, ZERO MERCY",
  "SCIENTISTS BAFFLED BY THIS MAN'S WRISTS",
  "LOCAL MAN TOO POWERFUL",
  "THE PROPHECY WAS TRUE",
  "SWEEPING IS BELIEVING",
  "COLD-BLOODED. ICE-VEINED. UNDEFEATED.",
  "GG GO NEXT (THERE IS NO NEXT)",
  "THE CONTROLLER WAS MERELY A FORMALITY",
  "HISTORIANS WILL WRITE OF THIS NIGHT",
  "100% WIN RATE, 200% EGO",
  "SOMEBODY CHECK HIM FOR CHEAT CODES",
  "AN UNSANCTIONED DISPLAY OF EXCELLENCE",
  "THE ICE BOWED FIRST",
  "FLAWLESS VICTORY",
  "HE CAME, HE SAW, HE CELLY'D",
  "MAXIMUM OVERSKILL",
  "THE LEAGUE DEMANDS AN INVESTIGATION",
  "SIMPLY UNFAIR TO EVERYONE INVOLVED",
  "BOW BEFORE YOUR NEW OVERLORD"
];

const LCD_HEADLINES = [
  "CERTIFIED BRUH MOMENT",
  "SOMEBODY COME GET THEM",
  "ROCK BOTTOM ACHIEVED",
  "CLOWN OF THE DAY",
  "PRAYERS UP FOR THIS ONE",
  "SPIRAL OF SHAME",
  "FROZEN IN FAILURE",
  "DOWNHILL EXPRESS",
  "MUST-SEE MISSES",
  "TRAGICOMEDY UNFOLDS",
  "SUNK WITHOUT A PADDLE",
  "EXPLOSIVE FLOP",
  "MELTED ON ICE",
  "WHITE FLAG WAVER",
  "A PERFECT RECORD (THE BAD KIND)",
  "ZERO WINS, INFINITE EXCUSES",
  "THE BENCH CALLED. IT WANTS HIM BACK.",
  "AN ALL-YOU-CAN-LOSE BUFFET",
  "BREAKING: MAN DISCOVERS NEW WAYS TO LOSE",
  "THE CONTROLLER DESERVED BETTER",
  "SWEPT LIKE AUTUMN LEAVES",
  "A MASTERCLASS IN SURRENDER",
  "SKILL ISSUE CONFIRMED BY EXPERTS",
  "HIS GOALIE HAS FILED FOR EMOTIONAL DAMAGES",
  "THE HUMAN OWN-GOAL",
  "0-3? IN THIS ECONOMY?",
  "NEW SPEEDRUN RECORD: FASTEST DEFEAT ANY%",
  "COACHES HATE HIM (SO DO TEAMMATES)",
  "THIS PERFORMANCE IS NOT FDA APPROVED",
  "A CANDLELIGHT VIGIL WILL BE HELD",
  "THE ICE WAS THE REAL WINNER",
  "DEFEAT SNATCHED FROM THE JAWS OF DEFEAT",
  "FROM ZERO TO ZERO",
  "GRAVITY WORKS: A CASE STUDY",
  "EMOTIONAL DAMAGE: CRITICAL HIT",
  "THE LEAGUE'S OFFICIAL SPEED BUMP"
];

//-------------------------------------------------------------
// EPITHETS + MAD-LIB FLOURISHES — combined into a daily nickname
// e.g.  Ryan "The Cataclysm" — Sultan of Sweeps
//-------------------------------------------------------------
const GCD_EPITHETS = [
  "The Cataclysm", "The Final Boss", "The Cheat Code", "The Avalanche",
  "The Guillotine", "Cold Hands, Colder Heart", "The Inevitable",
  "The Broom", "The Landlord", "Prime Time", "The Sweeper",
  "The Machine", "The Menace", "Big Game James (Legally Distinct)",
  "The Executioner", "The Blizzard", "The Highlight Reel",
  "The Problem", "The Undertaker of Fun", "His Royal Iceness"
];

const LCD_EPITHETS = [
  "The Traffic Cone", "The Empty Net", "The Speed Bump", "The Turnstile",
  "The Wet Napkin", "The Participation Award", "The Free Space",
  "The Warm-Up Drill", "The Loading Screen", "The Tutorial Boss",
  "The Pylon", "The Gentle Breeze", "The Practice Dummy",
  "The Bye Week", "The Soft Serve", "The Screen Saver",
  "The White Flag", "The Background Character", "The Ghost of Games Past",
  "Old Bendy Knees"
];

const FLOURISH_RANKS = [
  "Sultan", "Baron", "Archduke", "CEO", "Patron Saint", "Overlord",
  "Viceroy", "Grand Poobah", "Founding Father", "Regional Manager",
  "Warlord", "High Priest", "Ambassador", "Head Chef", "Landlord",
  "Chief Executive", "Duke", "Prophet", "Custodian", "Intern"
];

const GCD_FLOURISH_OBJECTS = [
  "Sweeps", "the Crease", "Backdoor Tap-Ins", "Absolute Cinema",
  "the Top Shelf", "Five-Hole Nation", "Unstoppable Wristers",
  "the Highlight Factory", "Clean Sheets", "the Broom Closet",
  "Victory Lane", "the Winner's Circle", "Celly City", "Pure Talent",
  "the Scoreboard"
];

const LCD_FLOURISH_OBJECTS = [
  "Own Goals", "the Bench", "Missed Nets", "Sadness",
  "the Penalty Box", "Whiffed One-Timers", "the L Train",
  "Squandered Leads", "the Dumpster", "Lost Causes",
  "Blown Coverage", "the Participation Table", "Empty Netters (Against)",
  "Rock Bottom", "the Group Chat's Pity"
];

//-------------------------------------------------------------
// SUBLINES — supporting sentence under the headline
//-------------------------------------------------------------
const GCD_SUBLINES = [
  "Three games. Three wins. Zero survivors.",
  "Witnesses describe the performance as 'upsetting to watch, honestly.'",
  "Sources confirm he never even broke a sweat.",
  "The other three players have entered witness protection.",
  "Experts recommend simply not playing against him.",
  "His controller has been sent to the Hall of Fame for testing.",
  "The Sheet has been notified. The Sheet is pleased.",
  "Opposing goalies reportedly still waking up in cold sweats.",
  "This message was approved by the Ministry of Domination.",
  "Analysts agree: that was rude.",
  "He'd like to thank no one, because he did it all himself.",
  "A moment of silence for everyone who queued into him.",
  "The league office is reviewing whether this was even legal.",
  "Somewhere, a scout is frantically taking notes."
];

const LCD_SUBLINES = [
  "Three games. Zero wins. One long evening.",
  "Witnesses describe the performance as 'technically hockey.'",
  "Thoughts and prayers are being accepted at this time.",
  "His teammates would like it known they did their best.",
  "Experts recommend unplugging the controller and reflecting.",
  "The Sheet has been notified. The Sheet is laughing.",
  "The zamboni driver saw more ice time than his offense.",
  "A support group meets Thursdays. He knows where.",
  "This message was approved by the Department of Yikes.",
  "Analysts agree: that was hard to watch.",
  "He'd like to thank the goal horn for staying silent all night.",
  "Scientists are studying the tape to learn what NOT to do.",
  "The league office has ruled it: skill issue.",
  "Somewhere, a coach is using this film as a warning."
];

//-------------------------------------------------------------
// "MEANWHILE" LINES — when the same night produced both a GCD and LCD
//-------------------------------------------------------------
const MEANWHILE_GCD = [
  "Meanwhile, {player} quietly swept the night. Show-off.",
  "Oh, and {player} won everything too. Nobody noticed. Awkward.",
  "Footnote: {player} also went 3-0 and demands recognition."
];
const MEANWHILE_LCD = [
  "Meanwhile, {player} lost every single game. Pour one out.",
  "In lesser news: {player} went 0-3. The less said, the better.",
  "Also that night: {player} donated three wins to charity.",
  "Meanwhile, {player} went 0-3 and is already drafting excuses.",
  "Also that night: {player} went 0-3. Somebody check if the football game was on."
];

//-------------------------------------------------------------
// FAKE NEWS TICKER ITEMS ({p} = random other player)
//-------------------------------------------------------------
const TICKER_ITEMS = [
  "SOURCES: {p} SEEN PRACTICING IN OFFLINE MODE",
  "{p} BLAMES CONTROLLER FOR THIRD CONSECUTIVE WEEK",
  "LOCAL COUCH RATED 'TOO COMFORTABLE' FOR COMPETITIVE PLAY",
  "SHEET UPDATE DELAYED; NATION HOLDS BREATH",
  "{p} DENIES RAGE QUIT ALLEGATIONS, EVIDENCE MOUNTS",
  "ANALYSTS: FIVE-HOLE REMAINS UNDEFENDED LEAGUE-WIDE",
  "{p} REPORTEDLY WATCHING 'HOW TO DEKE' TUTORIALS",
  "BREAKING: GOAL HORN REQUESTS OVERTIME PAY",
  "WEATHER: 100% CHANCE OF ICE",
  "{p} PETITIONS TO UNBAN THE AVALANCHE, DENIED INSTANTLY",
  "EXPERTS CONFIRM: ONE MORE GAME NEVER MEANS ONE MORE GAME",
  "{p} CLAIMS LAG; ROUTER DECLINES TO COMMENT",
  "TRADE RUMOR: {p} SHOPPED FOR FUTURE CONSIDERATIONS",
  "STUDY FINDS TRASH TALK IMPROVES WITH EVERY LOSS"
];

//-------------------------------------------------------------
// GAZETTE SIDE HEADLINES (fake newspaper filler)
//-------------------------------------------------------------
const GAZETTE_FILLER = [
  "Area Man Still Explaining What 'PPG' Means",
  "Opinion: The Mirror Button Is a War Crime",
  "Classifieds: Slightly Used Dignity, Free",
  "Weather: Cold, With a Chance of Sweeps",
  "Recipe Corner: Humble Pie, Serves One",
  "Ask The Ref: 'No, That Was Not Interference'",
  "Crossword Answer Is Just 'Skill Issue' Again",
  "Local Sheet Celebrates Another Day of Truth",
  "Horoscope: Avoid One-Timers This Week",
  "Sports: Yes, This Is the Sports Section",
  "Consumer Watch: Is the Premium Edition Pay-to-Win? One Man Says Yes",
  "Local Man Still Waiting on Dylan's Run It Back",
  "TV Listings: Whatever Football Game Nick Has On",
  "Op-Ed: \"I'm Still the Best\" by Ryan",
  "Real Estate: Dylan's Couch Remains Off the Market",
  "Science: Ryan's Posts-Hit Rate Defies Probability"
];

//-------------------------------------------------------------
// DAILY ORACLE FORTUNES ({p} = seeded player of the day)
//-------------------------------------------------------------
const FORTUNES = [
  "The Oracle foresees: {p} will blame the goalie tonight.",
  "The ice whispers... {p} is due for a sweep. Which kind? Unclear.",
  "Tonight's forbidden strategy: letting {p} pick the music.",
  "The Oracle has consulted the Sheet: {p} peaked last month.",
  "A great celly is coming. It will be premature. It will be {p}'s.",
  "The Oracle sees a five-hole in {p}'s future. It sees it clearly.",
  "Beware the third period, {p}. Beware.",
  "The Sheet knows what {p} did. The Sheet forgives nothing.",
  "Fortune favors the bold. It has no comment on {p}.",
  "The Oracle predicts {p} will say 'one more game' at least twice.",
  "Tonight, {p}'s one-timer will finally connect. The Oracle is 40% sure.",
  "The spirits demand {p} stop pulling the goalie so early.",
  "A crown drifts toward {p}... or is that a clown wig? Hard to say.",
  "The Oracle sees {p} typing 'lag' in the group chat already.",
  "Destiny calls for {p}. Destiny may be a wrong number.",
  "The Oracle advises {p} to stretch. It won't help, but still.",
  "Great glory OR great shame awaits {p} tonight. No middle ground.",
  "The Zamboni of Fate circles {p} hungrily.",
  "The Oracle checked twice: {p} is NOT him. Yet.",
  "Signs point to {p} hitting the post four times tonight."
];

//-------------------------------------------------------------
// PERSONAS — each player's running bits. These get mixed (at
// extra weight) into that player's banners, fortunes, ticker and
// birthday card, so the ribbing actually fits the person.
//   Tom:   owns the "premium edition" (Dylan insists it's pay-to-win)
//   Ryan:  believes he's the best; perpetually "unlucky"
//   Nick:  always distracted (usually football), so he gets the
//          better team by rule — his GCDs come with an asterisk
//   Dylan: nearly impossible to get online, never runs it back,
//          prefers home; knows every player's ratings and abilities
//-------------------------------------------------------------
const PERSONAS = {
  Tom: {
    gcdEpithets: ["Premium Edition", "The Pay-to-Win Prince", "The Microtransaction", "Deluxe Tom", "The Season Pass"],
    lcdEpithets: ["The Refund Request", "Premium Edition (Expired)", "The Free Trial"],
    gcdSublines: [
      "Dylan has filed a formal complaint: \"It's the premium edition. The puck physically cannot leave his stick.\"",
      "Every poke check connected. Dylan says that's a premium edition feature. Dylan may be right.",
      "Unlocked with the premium edition's exclusive Sweep DLC (allegedly)."
    ],
    lcdSublines: [
      "Lost all three on the premium edition. Dylan is requesting a full investigation into how that's even possible.",
      "Turns out the premium edition doesn't include a refund for this."
    ],
    fortunes: [
      "The Oracle sees a lucky poke check in Tom's future. Dylan sees the premium edition.",
      "The Oracle predicts Dylan will mention the premium edition within ten minutes of puck drop."
    ],
    ticker: [
      "DYLAN: 'IT'S THE PREMIUM EDITION' (847TH REPORTED INSTANCE)",
      "EA DENIES TOM'S PREMIUM EDITION INCLUDES 'PUCK MAGNET' PERK",
      "TOM'S POKE CHECK SUCCESS RATE UNDER LEAGUE REVIEW"
    ],
    birthdayLines: [
      "Another year older, and the premium edition is still doing all the work (source: Dylan).",
      "Dylan's gift to Tom: a strongly worded letter about pay-to-win mechanics.",
      "Happy birthday to the only man whose poke checks come with a receipt.",
      "Celebrating {gcds} career GCDs, every one of them premium-edition-assisted (according to Dylan)."
    ],
    birthdayWishes: [
      "Wish granted: a free upgrade to the Premium Premium Edition. Dylan has already filed a complaint.",
      "Wish granted: the puck will stick to your blade tonight. Dylan says it always does.",
      "Wish granted: one lucky poke check per period, as the premium edition intends."
    ]
  },

  Ryan: {
    gcdEpithets: ["The Self-Proclaimed", "Mr. Told You So", "The Rightful King (His Words)", "The Self-Appointed GOAT"],
    lcdEpithets: ["The Unlucky (Allegedly)", "Mr. Bad Bounce", "Captain Posts", "The Self-Proclaimed GOAT"],
    gcdSublines: [
      "Ryan would like everyone to know he's been saying this the whole time.",
      "For once the bounces went his way. He considers this the natural order restored.",
      "He'd like the record to show this was always the expected outcome."
    ],
    lcdSublines: [
      "Ryan blames the bounces. The bounces have hired a lawyer.",
      "Self-reported skill level: elite. Sheet-reported results: see above.",
      "Three posts, two deflections and one \"are you KIDDING me.\" Allegedly unlucky.",
      "The best player in the group (source: Ryan) went 0-3."
    ],
    fortunes: [
      "The Oracle foresees Ryan hitting two posts and blaming the game engine.",
      "The Oracle sees a fluke deflection in Ryan's future. Against him, obviously.",
      "Ryan will claim he's the best player in the room. The Oracle declines to comment."
    ],
    ticker: [
      "RYAN FILES FORMAL COMPLAINT AGAINST GOAL POSTS",
      "RYAN: 'I'M STILL THE BEST.' SHEET: NO COMMENT",
      "PHYSICISTS STUDY RYAN'S DEFLECTION LUCK; SEVERAL CAREERS RUINED"
    ],
    birthdayLines: [
      "Happy birthday to the best player in the group (according to the birthday boy).",
      "Another year of being robbed by the bounces. Happy birthday, Ryan.",
      "Ryan is one year older and still convinced he's the best. Nobody has the heart to show him the Sheet."
    ],
    birthdayWishes: [
      "Wish granted: the bounces will go your way tonight. (Offer not valid in any game.)",
      "Wish denied: the RNG remembers everything.",
      "Wish granted: everyone will agree you're the best. For the next eleven seconds."
    ]
  },

  Nick: {
    gcdEpithets: ["The Asterisk", "Second Screen Sniper", "The Favorite (By Rule)", "The Handicap Champion"],
    lcdEpithets: ["The Distracted", "Commercial Break", "Red Zone Refugee", "Two-Screen Tragedy"],
    gcdSublines: [
      "Achieved with the better team, as the rules intend. Asterisk applied.",
      "Played all three games with one eye on the football game. Still swept. Rude.",
      "The handicap system worked perfectly. Maybe too perfectly.",
      "Sources confirm the football game was on mute. That was the difference."
    ],
    lcdSublines: [
      "Had the better team. Had a football game on. Chose the football game.",
      "Losing with the stronger roster takes a special kind of multitasking.",
      "Fantasy lineup: set. Hockey lineup: forgotten.",
      "The rules gave him the better team. The rules can only do so much."
    ],
    fortunes: [
      "The Oracle sees Nick checking a football score mid-power play.",
      "Nick will get the better team tonight. The Oracle is 100% sure. It's literally the rules.",
      "The Oracle predicts a third-down conversion will cost Nick a goal against."
    ],
    ticker: [
      "NICK ASKS 'WAIT, WHAT HAPPENED?' FOR FOURTH TIME THIS PERIOD",
      "FOOTBALL GAME HITS TWO-MINUTE WARNING; NICK'S DEFENSE TAKES TWO-MINUTE NAP",
      "LEAGUE OFFICE REVIEWS NICK'S GCDS, ADDS ASTERISKS"
    ],
    birthdayLines: [
      "Gift idea for Nick: a TV that only shows hockey.",
      "Today Nick gets the better team AND cake. As is tradition.",
      "Happy birthday, Nick. Please put your phone down for the candles."
    ],
    birthdayWishes: [
      "Wish granted: no football on tonight. (Wish revoked: there is football on tonight.)",
      "Wish granted: the better team, as always. Happy birthday.",
      "Wish granted: full attention for one entire period."
    ]
  },

  Dylan: {
    gcdEpithets: ["The Scout", "The X-Factor Encyclopedia", "The Rare Sighting", "One and Done"],
    lcdEpithets: ["The Homebody", "One and Done", "The Hermit", "The Couch Loyalist"],
    gcdSublines: [
      "He knew every player's zone ability before puck drop. Of course he did.",
      "Swept it, logged off. He will not be running it back.",
      "A rare sighting AND a sweep. Mark your calendars, he won't be back for a while.",
      "Won with the scouting report, not the roster."
    ],
    lcdSublines: [
      "Finally showed up and this happened. See you in three weeks, probably.",
      "Knew every player's X-Factor. Didn't help.",
      "He'd rather be home. Based on this, he should have stayed there.",
      "Lost all three, logged off instantly. No run it back. Never a run it back."
    ],
    fortunes: [
      "The Oracle sees Dylan saying \"just one.\" The Oracle believes him.",
      "The Oracle predicts Dylan already knows tonight's goalies' save percentages.",
      "Dylan will be home tonight. Dylan is always home.",
      "The Oracle has a vision of a run it back. Wait, no. Dylan logged off."
    ],
    ticker: [
      "DYLAN SPOTTED AT HOME; EXPERTS CALL IT 'EXTREMELY ON BRAND'",
      "'RUN IT BACK?' DYLAN HAS LOGGED OFF",
      "DYLAN CITES SPEED RATINGS IN PREGAME SPEECH; NOBODY ASKED",
      "SEARCH PARTY FOR DYLAN CALLED OFF: HE WAS HOME"
    ],
    birthdayLines: [
      "Dylan's birthday plans: home. Obviously.",
      "Birthday wish: one session, then bed. Run it back? Not even today.",
      "Gift idea for Dylan: a second session. He will return it."
    ],
    birthdayWishes: [
      "Wish granted: you never have to leave the house again. (You already don't.)",
      "Wish granted: one game. Exactly one. No run it back.",
      "Wish granted: every opponent's X-Factor, memorized. As usual."
    ]
  }
};

// "Days without chel" sign — shows once the crew has gone 3+ days
// without a session. Dylan gets the blame, as is tradition.
const DROUGHT_LEVELS = [
  { min: 30, lines: [
    "A full month. The Sheet is gathering dust. This is Dylan's legacy.",
    "The ice has melted. Historians will blame Dylan's couch."
  ] },
  { min: 14, lines: [
    "Two weeks. The ice is getting soft. Somebody text Dylan.",
    "Fourteen days. Dylan's couch has filed for a restraining order on the controller."
  ] },
  { min: 7, lines: [
    "A whole week. Search party assembled. Dylan last seen on his couch.",
    "Seven days. Dylan says he's \"busy.\" Dylan is home."
  ] },
  { min: 3, lines: [
    "Dylan is home. Dylan is always home.",
    "Nobody has played in days. Everyone knows why. (Dylan.)"
  ] }
];

//-------------------------------------------------------------
// BIRTHDAYS (MM/DD, Central Time). On the day: a cake card with
// one candle per GCD to blow out, a party hat in the standings,
// and a countdown in the footer the rest of the year.
//-------------------------------------------------------------
const BIRTHDAYS = {
  Tom: "11/22",
  Ryan: "12/28",
  Nick: "07/19",
  Dylan: "08/13"
};

// {p} = birthday player, {gcds}/{lcds} = career counts, {title} = current GCD title
const BIRTHDAY_HEADLINES = [
  "HAPPY BIRTHDAY, {P}!",
  "IT'S {P} DAY. CLEAR THE ICE.",
  "ANOTHER LAP AROUND THE SUN FOR {P}",
  "{P} HAS LEVELED UP",
  "NATIONAL {P} DAY (OBSERVED)",
  "THE SHEET WISHES {P} A HAPPY BIRTHDAY",
  "BIRTHDAY PROTOCOL ACTIVATED: {P}"
];

const BIRTHDAY_LINES = [
  "{gcds} GCDs, {lcds} LCDs, and somehow only one birthday a year. Make it count.",
  "Today's matchups are rigged in {p}'s favor. (They are not. But act like it.)",
  "By royal decree, {p} cannot be LCD'd today. (Royal decree not legally binding.)",
  "The Sheet has granted {p} immunity from trash talk until midnight. Mostly.",
  "Scientists confirm {p} is one year older and zero years better at one-timers.",
  "Gift idea: let {p} win one. Just one. On purpose. Nobody tell him.",
  "{p} is now old enough to know better and still pull the goalie in the second period.",
  "Celebrating {gcds} career sweeps and roughly {lcds} reasons to stay humble.",
  "Birthday rules: {p} picks the music, the snacks, and the excuses.",
  "Another year closer to the title \"{title}\" being a tombstone inscription."
];

const BIRTHDAY_WISHES = [
  "Wish granted: tonight's first goal goes in off a defenseman's skate. Yours.",
  "Wish granted: zero posts hit tonight. (Offer void after the first period.)",
  "Wish granted: one guaranteed GCD... in your dreams. Literally.",
  "Wish granted: everyone else's controller is at 4% battery.",
  "Wish received. The Sheet is processing your request. Estimated wait: 1 year.",
  "Wish granted: your teammate will finally pass you the puck.",
  "Wish granted: a cake-flavored power play.",
  "Wish denied by league office. Happy birthday anyway."
];

//-------------------------------------------------------------
// STANDINGS RANK LABELS (1st through 4th)
//-------------------------------------------------------------
const RANK_LABELS = ["THE THRONE", "CONTENDER", "MID TABLE", "ROCK BOTTOM"];

//-------------------------------------------------------------
// SPECIAL SEED TOASTS — exact seeds, plus meme suffixes that
// fire whenever a seed merely ENDS with 67 / 69 / 420.
//-------------------------------------------------------------
const SPECIAL_SEEDS = {
  "0": "Seed 0: the dawn of time. There was no hockey. It was terrible.",
  "1": "Seed 1: In the beginning, there was the Sheet.",
  "1337": "Elite seed detected. Performance not included.",
  "69420": "The council acknowledges your maturity.",
  "8675309": "Jenny does not want to play Chel."
};

const SEED_SUFFIX_MESSAGES = {
  "67": "6️⃣7️⃣ SIX SEVENNNN 🙌 (we apologize for this seed)",
  "69": "Nice.",
  "420": "Blaze it? No. Skate it."
};

//-------------------------------------------------------------
// MONTHLY GARNISH (small seasonal accent in the footer)
//-------------------------------------------------------------
const MONTH_GARNISH = {
  0: "❄️", 1: "💘", 2: "🍀", 3: "🌧️", 4: "🌸", 5: "☀️",
  6: "🎆", 7: "🏖️", 8: "🍁", 9: "🎃", 10: "🦃", 11: "🎄"
};
