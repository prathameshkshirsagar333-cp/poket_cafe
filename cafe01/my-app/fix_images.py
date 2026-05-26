"""Replace all menu item image paths in Menu.tsx with reliable Unsplash URLs."""

with open('app/components/Menu.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Map of id -> reliable unsplash URL
urls = {
    # COFFEE
    1:  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop",
    2:  "https://images.unsplash.com/photo-1447078806655-40579c2520d6?w=800&q=80&auto=format&fit=crop",
    7:  "https://images.unsplash.com/photo-1495474472205-1a429007f561?w=800&q=80&auto=format&fit=crop",
    8:  "https://images.unsplash.com/photo-1461023058943-07cb12ee80fb?w=800&q=80&auto=format&fit=crop",
    9:  "https://images.unsplash.com/photo-1514432324607-a12529f4aad4?w=800&q=80&auto=format&fit=crop",
    10: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=800&q=80&auto=format&fit=crop",
    11: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80&auto=format&fit=crop",
    12: "https://images.unsplash.com/photo-1498804103009-848e026217dc?w=800&q=80&auto=format&fit=crop",
    13: "https://images.unsplash.com/photo-1481833751846-9571ff2c5f1a?w=800&q=80&auto=format&fit=crop",
    14: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80&auto=format&fit=crop",
    15: "https://images.unsplash.com/photo-1508424580648-52fead096edec?w=800&q=80&auto=format&fit=crop",
    16: "https://images.unsplash.com/photo-1481833751846-9571ff2c5f1a?w=800&q=80&auto=format&fit=crop",
    17: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=800&q=80&auto=format&fit=crop",
    18: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800&q=80&auto=format&fit=crop",
    19: "https://images.unsplash.com/photo-1504627298434-2032fbc7369f?w=800&q=80&auto=format&fit=crop",
    20: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=800&q=80&auto=format&fit=crop",
    21: "https://images.unsplash.com/photo-1610889556528-9a770e3264a1?w=800&q=80&auto=format&fit=crop",
    22: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80&auto=format&fit=crop",
    23: "https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=800&q=80&auto=format&fit=crop",
    24: "https://images.unsplash.com/photo-1552599557-cb3ded3ebf61?w=800&q=80&auto=format&fit=crop",
    # TEA
    3:  "https://images.unsplash.com/photo-1515823662972-da6a2909c06b?w=800&q=80&auto=format&fit=crop",
    4:  "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80&auto=format&fit=crop",
    25: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80&auto=format&fit=crop",
    26: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&q=80&auto=format&fit=crop",
    27: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80&auto=format&fit=crop",
    28: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&auto=format&fit=crop",
    29: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80&auto=format&fit=crop",
    30: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80&auto=format&fit=crop",
    31: "https://images.unsplash.com/photo-1564890369478-c89ca6d6cde9?w=800&q=80&auto=format&fit=crop",
    32: "https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?w=800&q=80&auto=format&fit=crop",
    # DESSERT
    5:  "https://images.unsplash.com/photo-1511018556340-d16986a1c194?w=800&q=80&auto=format&fit=crop",
    6:  "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80&auto=format&fit=crop",
    # SNACKS
    33: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800&q=80&auto=format&fit=crop",
    34: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80&auto=format&fit=crop",
    35: "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=800&q=80&auto=format&fit=crop",
    36: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
    37: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80&auto=format&fit=crop",
    38: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80&auto=format&fit=crop",
    39: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&q=80&auto=format&fit=crop",
    40: "https://images.unsplash.com/photo-1619531040576-f9416740661e?w=800&q=80&auto=format&fit=crop",
    41: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&q=80&auto=format&fit=crop",
}

import re

for id_num, url in urls.items():
    # Match: image: "/menu/N.jpg" or  image: "https://..."
    pattern = r'(id: ' + str(id_num) + r'[^}]+image: ")[^"]*(")'
    replacement = rf'\g<1>{url}\g<2>'
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        print(f"[{id_num}] Updated.")
        content = new_content
    else:
        print(f"[{id_num}] No match found - skipped.")

with open('app/components/Menu.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! All images updated.")
