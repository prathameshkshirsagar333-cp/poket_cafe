import os
import time
import requests
import re
import json

os.makedirs("public/menu", exist_ok=True)

items = {
    # Snacks
    33: ("Veg Sandwich", "veg sandwich cafe style"),
    34: ("Grilled Cheese Sandwich", "grilled cheese sandwich delicious"),
    35: ("Paneer Tikka Sandwich", "paneer tikka sandwich street food cafe"),
    36: ("Veg Burger", "veg burger cafe meal"),
    37: ("Paneer Burger", "paneer burger cafe fast food"),
    38: ("French Fries", "crispy french fries bowl"),
    39: ("Peri Peri Fries", "peri peri french fries spicy cafe"),
    40: ("Garlic Bread", "garlic bread slices cafe"),
    41: ("Cheese Garlic Bread", "cheese garlic bread baked slices"),
    
    # Previous Coffee
    1: ("Kumbakonam Degree Coffee", "South Indian filter coffee authentic brand"),
    2: ("Malabar Peaberry", "Malabar Peaberry coffee beans blue tokai"),
    7: ("Kodaikanal Arabica", "kodaikanal arabica coffee estate"),
    8: ("Nilgiri Blue Mountain", "nilgiri blue mountain coffee beans proper"),
    9: ("Bababudangiri Arabica", "bababudangiri arabica third wave coffee"),
    10: ("Robusta Kaapi", "robusta coffee beans indian brand"),
    11: ("Karupatti Kaapi", "karupatti coffee palm jaggery"),
    12: ("Sukku Malli Coffee", "sukku coffee powder traditional"),
    13: ("Panankalkandu Kaapi", "palm candy coffee traditional"),
    14: ("Madras Filter Coffee", "madras filter coffee traditional steel cup"),
    15: ("South Indian Filter Coffee", "south indian filter coffee id organic"),
    16: ("Mysore Nuggets Extra Bold", "mysore nuggets extra bold blue tokai"),
    17: ("Monsooned Malabar", "monsooned malabar coffee blue tokai"),
    18: ("Araku Valley Coffee", "araku valley coffee official premium"),
    19: ("Coorg Arabica", "coorg arabica coffee organic"),
    20: ("Chikmagalur Coffee", "chikmagalur coffee authentic beans"),
    21: ("Wayanad Robusta", "wayanad robusta coffee beans"),
    22: ("Indian Espresso", "starbucks espresso shot cup"),
    23: ("Filter Kaapi Frappe", "cold coffee frappe starbucks tall glass"),
    24: ("Cardamom Spiced Coffee", "cardamom coffee traditional indian cup"),
    
    # Tea
    3: ("Matcha green Tea", "starbucks iced matcha green tea latte"),
    4: ("Earl Grey", "twinings earl grey tea cup"),
    25: ("Masala Chai", "taj mahal tea masala chai cup"),
    26: ("Darjeeling First Flush", "darjeeling first flush tea authentic"),
    27: ("Assam Strong CTC", "assam ctc tea authentic black"),
    28: ("Lemon Iced Tea", "lipton lemon iced tea glass"),
    29: ("Chamomile Flower Tea", "twinings chamomile tea cup clear"),
    30: ("Kashmiri Kahwa", "kashmiri kahwa tea authentic traditional"),
    31: ("Mint Green Tea", "lipton mint green tea authentic"),
    32: ("Hibiscus Berry Tea", "starbucks passion tango iced tea")
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36'}

for id, (name, q) in items.items():
    filepath = f"public/menu/{id}.jpg"
    if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
        continue
        
    print(f"[{id}] Searching for: {name}")
    search_url = f"https://www.bing.com/images/search?q={requests.utils.quote(q)}"
    
    try:
        r = requests.get(search_url, headers=headers, timeout=10)
        # Find all image links
        matches = re.findall(r'murl&quot;:&quot;(https://[^&]+?\.(?:jpg|jpeg|png))&quot;', r.text)
        success = False
        for img_url in matches[:5]: # Try up to 5 images
            try:
                img_data = requests.get(img_url, headers=headers, timeout=5)
                if img_data.status_code == 200 and len(img_data.content) > 10000:
                    with open(filepath, 'wb') as f:
                        f.write(img_data.content)
                    print(f"[{id}] Downloaded successfully.")
                    success = True
                    break
            except:
                continue
                
        if not success:
            print(f"[{id}] Failed to download from bing matches, using dummy fallback")
            img_data = requests.get(f"https://picsum.photos/seed/{id}/400/400", headers=headers)
            with open(filepath, 'wb') as f:
                f.write(img_data.content)
    except Exception as e:
        print(f"[{id}] Error: {e}")
        
    time.sleep(1)

print("All images downloaded.")
