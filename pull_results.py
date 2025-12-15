#!/usr/bin/env python3
"""
Fetch the current results from a Google Sheet and save them as JSON.

This script expects the sheet to contain entries appended sequentially with a simple
two‑column structure (label and value). Each entry begins with a row where the
label column is "matchup" and is followed by rows for "date", "Winning Team",
"Winning Player 1", "Winning Player 2", "Losing Team", "Losing Player 1",
and "Losing Player 2". When a new "matchup" label is encountered, a new entry
is started. The script groups these rows accordingly and writes a list of
dictionaries to results.json.

To configure which Google Sheet to pull from, set the SHEET_ID constant below
to the ID of your sheet (the long string in the sheet's URL). The sheet must
be published or shared publicly for this fetch to succeed without
authentication. Alternatively, you could use a service account and Google
Sheets API; however, this simple export keeps the project static.

The JSON output will be written to `results.json` in the repository root.
"""

import csv
import json
import os
from typing import List, Dict

import requests

# Replace this with your actual Google Sheets document ID. For example, if your
# sheet URL is https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxY/edit,
# then SHEET_ID should be "1AbCdEfGhIjKlMnOpQrStUvWxY".
SHEET_ID = "1ZS1sG6XIYgm1bOeSSqkQ8kQRUQyzImOlMWao6Nk0YLw"

def fetch_sheet_tsv(sheet_id: str) -> List[List[str]]:
    """Download the sheet as TSV and return rows of values."""
    export_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=tsv"
    resp = requests.get(export_url)
    resp.raise_for_status()
    lines = resp.text.splitlines()
    reader = csv.reader(lines, delimiter="\t")
    return list(reader)

def parse_entries(rows: List[List[str]]) -> List[Dict[str, str]]:
    """Group rows into entries based on the 'matchup' label in the first column."""
    entries: List[Dict[str, str]] = []
    current: Dict[str, str] | None = None
    for row in rows:
        if not row or len(row) < 2:
            continue
        label = row[0].strip()
        value = row[1].strip()
        if label.lower() == "matchup":
            # Starting a new entry
            if current:
                entries.append(current)
            current = {"matchup": value}
        else:
            if current is None:
                # Skip rows before first matchup label
                continue
            current[label] = value
    # append last entry
    if current:
        entries.append(current)
    return entries

def main() -> None:
    if not SHEET_ID or SHEET_ID == "placeholder":
        print("SHEET_ID is not configured; skipping results fetch.")
        return
    try:
        rows = fetch_sheet_tsv(SHEET_ID)
        entries = parse_entries(rows)
        out_path = os.path.join(os.path.dirname(__file__), "results.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(entries, f, indent=2)
        print(f"Fetched {len(entries)} entries from sheet and wrote to results.json")
    except Exception as e:
        print(f"Failed to fetch or parse sheet: {e}")

if __name__ == "__main__":
    main()