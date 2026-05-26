import re

with open('app/components/Menu.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace image URLs for IDs 1-4, 7-41
for id in list(range(1,5)) + list(range(7,42)):
    pattern = r'(\{ id: ' + str(id) + r',.+?image: ")([^"]+)(".*?\})'
    text = re.sub(pattern, r'\g<1>/menu/' + str(id) + r'.jpg\g<3>', text)

with open('app/components/Menu.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated image paths in Menu.tsx")
