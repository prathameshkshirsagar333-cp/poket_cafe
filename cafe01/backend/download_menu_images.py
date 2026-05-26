import os
import time
import requests
from duckduckgo_search import DDGS

os.makedirs("public/menu", exist_ok=True)

items = [
    (1, "Kumbakonam Degree Coffee cup authentic south indian"),
    (2, "Malabar Peaberry coffee official"),
    (7, "Kodaikanal Arabica coffee official"),
    (8, "Nilgiri Blue Mountain coffee beans"),
    (9, "Bababudangiri Arabica coffee official"),
    (10, "Robusta Kaapi official"),
    (11, "Karupatti Kaapi traditional coffee"),
    (12, "Sukku Malli Coffee authentic"),
    (13, "Panankalkandu Kaapi palm sugar coffee"),
    (14, "Madras Filter Coffee cup authentic"),
    (15, "South Indian Filter Coffee tumbler brass"),
    (16, "Mysore Nuggets Extra Bold coffee official"),
    (17, "Monsooned Malabar coffee official"),
    (18, "Araku Valley Coffee official"),
    (19, "Coorg Arabica coffee official"),
    (20, "Chikmagalur Coffee official"),
    (21, "Wayanad Robusta coffee official"),
    (22, "Indian Espresso official starbucks"),
    (23, "Filter Kaapi Frappe cold coffee official"),
    (24, "Cardamom Spiced Coffee official"),
    (3, "Matcha green Tea official starbucks"),
    (4, "Earl Grey Tea official twinings"),
    (25, "Masala Chai official taj mahal tea"),
    (26, "Darjeeling First Flush tea official"),
    (27, "Assam Strong CTC tea official"),
    (28, "Lemon Iced Tea official lipton"),
    (29, "Chamomile Flower Tea official twinings"),
    (30, "Kashmiri Kahwa tea authentic"),
    (31, "Mint Green Tea official"),
    (32, "Hibiscus Berry Tea official starbucks")
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

for id, query in items:
    filepath = f"public/menu/{id}.jpg"
    if os.path.exists(filepath):
        print(f"[{id}] already exists")
        continue
        
    print(f"[{id}] Searching for: {query}")
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=5))
            for res in results:
                img_url = res.get('image')
                if not img_url: continue
                try:
                    r = requests.get(img_url, timeout=5, headers=headers)
                    if r.status_code == 200:
                        with open(filepath, 'wb') as f:
                            f.write(r.content)
                        print(f"[{id}] Downloaded successfully!")
                        break
                except Exception as e:
                    pass
    except Exception as e:
        print(f"[{id}] Error searching: {e}")
    
    time.sleep(3) # Avoid rate limits
