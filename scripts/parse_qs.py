import pandas as pd
import json
import re

# Read Excel
df = pd.read_excel('2026QSWorldUniversityRankings.xlsx', header=2)
qs_data = []

# Rank can be like '1', '2', '31=', '401-410'
for _, row in df.iterrows():
    name = str(row['Name']).strip()
    rank_str = str(row['Rank']).strip()
    
    if name == 'nan' or rank_str == 'nan':
        continue
        
    # Extract numeric part of rank (e.g. '31=' -> 31, '401-410' -> 401)
    match = re.search(r'^(\d+)', rank_str)
    if match:
        rank = int(match.group(1))
        qs_data.append({
            'name': name,
            'rank': rank
        })

with open('qs_parsed.json', 'w') as f:
    json.dump(qs_data, f, indent=2)
print(f"Parsed {len(qs_data)} QS entries")
