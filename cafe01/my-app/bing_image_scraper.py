import os
import time
import requests
import json
import re

items = {
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

urls = {}

for id, (name, q) in items.items():
    print(f"[{id}] Searching Bing Images for: {q}")
    search_url = f"https://www.bing.com/images/search?q={requests.utils.quote(q)}"
    
    try:
        r = requests.get(search_url, headers=headers, timeout=10)
        # Bing images usually have raw links in generic murl="..."
        matches = re.findall(r'murl&quot;:&quot;(https://[^&]+?\.(?:jpg|jpeg|png))&quot;', r.text)
        if matches:
            img_url = matches[0]
            print(f"[{id}] Found: {img_url}")
            urls[id] = img_url
        else:
            print(f"[{id}] No matches found.")
    except Exception as e:
        print(f"[{id}] Error searching: {e}")
    time.sleep(1)

with open("scraped_image_urls.json", "w") as f:
    json.dump(urls, f, indent=4)

print("Done generating JSON.")
