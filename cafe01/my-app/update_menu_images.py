import json
import re

with open('scraped_image_urls.json', 'r') as f:
    urls = json.load(f)

with open('app/components/Menu.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

for id_str, img_url in urls.items():
    # We want to match: { id: <num>, name: "...", ..., image: "...", popular: ... }
    # Since Menu.tsx has { id: 1, ... image: "https://images.unsplash.com/..." ... }
    # We will use regex to find the object with id: <id_str> and replace its image string
    
    # Pattern to match the line containing `id: <id_str>,`
    pattern = r'(\{ id: ' + id_str + r',.+?image: ")([^"]+)(".*?\})'
    
    # Replace the captured image URL with the new img_url
    content = re.sub(pattern, r'\g<1>' + img_url + r'\g<3>', content)

with open('app/components/Menu.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Menu.tsx with new official images successfully.")
