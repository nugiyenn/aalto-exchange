import pypdf
import json
import re

reader = pypdf.PdfReader('TECH-application-statistics.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

# Replace weird characters
text = text.replace('\u00a0', ' ')
lines = text.split('\n')

results = []

pattern = re.compile(r'^(.*?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d,]+|‐|-)\s+([\d,]+|‐|-)\s+([\d,]+|‐|-)\s+([\d,]+|‐|-)$')

for line in lines:
    line = line.strip()
    match = pattern.search(line)
    if match:
        name_part = match.group(1).strip()
        
        uni_name = name_part
        if ":" in uni_name:
            parts = uni_name.split(":", 1)
            after_colon = parts[1]
            if "‐" in after_colon:
                uni_name = after_colon.rsplit("‐", 1)[0].strip()
            elif "-" in after_colon:
                uni_name = after_colon.rsplit("-", 1)[0].strip()
            else:
                uni_name = after_colon.strip()
                
        results.append({
            "original_name": name_part,
            "university_name": uni_name,
            "applicants_1st": match.group(2),
            "applicants_2nd": match.group(3),
            "applicants_3rd": match.group(4),
            "applicants_total": match.group(5),
            "index_2025": match.group(6).replace('‐', '-'),
            "index_2024": match.group(7).replace('‐', '-'),
            "index_2023": match.group(8).replace('‐', '-'),
            "index_2022": match.group(9).replace('‐', '-')
        })

with open('src/data/tech-statistics.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(results)} records")
