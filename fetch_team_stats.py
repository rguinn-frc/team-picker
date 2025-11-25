#!/usr/bin/env python3
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Season + game type (2 = regular season)
SEASON_ID = "20252026"
GAME_TYPE_ID = 2

# Map franchiseName -> teamAbbrev
TEAM_ABBRS = {
    "Anaheim Ducks": "ANA",
    "Arizona Coyotes": "ARI",
    "Boston Bruins": "BOS",
    "Buffalo Sabres": "BUF",
    "Calgary Flames": "CGY",
    "Carolina Hurricanes": "CAR",
    "Chicago Blackhawks": "CHI",
    "Colorado Avalanche": "COL",
    "Columbus Blue Jackets": "CBJ",
    "Dallas Stars": "DAL",
    "Detroit Red Wings": "DET",
    "Edmonton Oilers": "EDM",
    "Florida Panthers": "FLA",
    "Los Angeles Kings": "LAK",
    "Minnesota Wild": "MIN",
    "Montréal Canadiens": "MTL",
    "Nashville Predators": "NSH",
    "New Jersey Devils": "NJD",
    "New York Islanders": "NYI",
    "New York Rangers": "NYR",
    "Ottawa Senators": "OTT",
    "Philadelphia Flyers": "PHI",
    "Pittsburgh Penguins": "PIT",
    "San Jose Sharks": "SJS",
    "Seattle Kraken": "SEA",
    "St. Louis Blues": "STL",
    "Tampa Bay Lightning": "TBL",
    "Toronto Maple Leafs": "TOR",
    "Vancouver Canucks": "VAN",
    "Vegas Golden Knights": "VGK",
    "Washington Capitals": "WSH",
    "Winnipeg Jets": "WPG",
    "Utah Mammoth": "UTA",
}

# Map abbr -> colour group (same as your JS)
TEAM_COLORS = {
    "ANA": "orange",
    "ARI": "red",
    "BOS": "yellow",
    "BUF": "blue",
    "CGY": "red",
    "CAR": "red",
    "CHI": "red",
    "COL": "burgundy",
    "CBJ": "blue",
    "DAL": "green",
    "DET": "red",
    "EDM": "orange",
    "FLA": "red",
    "LAK": "black",
    "MIN": "green",
    "MTL": "red",
    "NSH": "yellow",
    "NJD": "red",
    "NYI": "blue",
    "NYR": "blue",
    "OTT": "red",
    "PHI": "orange",
    "PIT": "yellow",
    "SJS": "teal",
    "SEA": "teal",
    "STL": "blue",
    "TBL": "blue",
    "TOR": "blue",
    "VAN": "blue",
    "VGK": "gold",
    "WSH": "red",
    "WPG": "blue",
    "UTA": "blue",
}

def fetch_team_stats():
    url = "https://api.nhle.com/stats/rest/en/team/summary"
    params = {
        "isAggregate": "true",
        "isGame": "false",
        "sort": '[{"property":"points","direction":"DESC"}]',
        "cayenneExp": f"seasonId={SEASON_ID} and gameTypeId={GAME_TYPE_ID}",
    }
    resp = requests.get(url, params=params, verify=False)
    resp.raise_for_status()
    return resp.json()["data"]

def main():
    data = fetch_team_stats()

    print("const FALLBACK_TEAMS = [")

    for row in data:
        name = row.get("franchiseName", "Unknown")
        abbr = TEAM_ABBRS.get(name)

        if abbr is None:
            # If a new franchise appears, you'll see it and can add it to TEAM_ABBRS
            print(f"  // WARNING: no abbrev mapping for '{name}', skipping")
            continue

        pts = row.get("points", 0)
        gf = float(row.get("goalsForPerGame", 0.0))
        ga = float(row.get("goalsAgainstPerGame", 0.0))
        color = TEAM_COLORS.get(abbr, "unknown")

        print(
            f"  {{ name: '{name}', abbr: '{abbr}', pts: {pts}, "
            f"gf: {gf:.2f}, ga: {ga:.2f}, color: '{color}' }},"
        )

    print("];")

if __name__ == "__main__":
    main()
