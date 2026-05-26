import os
import time
import requests

os.makedirs("public/menu", exist_ok=True)

items = {
    1: "Filter_coffee", 
    2: "Coffee_bean",
    7: "Coffea_arabica",
    8: "Blue_Mountain_coffee",
    9: "Coffea_arabica",
    10: "Coffea_canephora",
    11: "Jaggery",
    12: "Ginger_tea",
    13: "Palm_sugar",
    14: "Indian_filter_coffee",
    15: "Indian_filter_coffee",
    16: "Coffee_production_in_India",
    17: "Monsooned_Malabar",
    18: "Coffee_production_in_India",
    19: "Coffea_arabica",
    20: "Chikmagalur",
    21: "Coffea_canephora",
    22: "Espresso",
    23: "Frappé_coffee",
    24: "Cardamom",
    3: "Matcha",
    4: "Earl_Grey_tea",
    25: "Masala_chai",
    26: "Darjeeling_tea",
    27: "Assam_tea",
    28: "Iced_tea",
    29: "Chamomile",
    30: "Kahwah",
    31: "Maghrebi_mint_tea",
    32: "Hibiscus_tea"
}

headers = {'User-Agent': 'Mozilla/5.0'}

for id, title in items.items():
    filepath = f"public/menu/{id}.jpg"
    if os.path.exists(filepath):
        print(f"[{id}] exists")
        continue

    print(f"Fetching {title}...")
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=pageimages&format=json&pithumbsize=800"
    
    try:
        r = requests.get(url, headers=headers)
        data = r.json()
        pages = data['query']['pages']
        image_url = None
        for page_id in pages:
            if 'thumbnail' in pages[page_id]:
                image_url = pages[page_id]['thumbnail']['source']
                break
        
        if image_url:
            img_r = requests.get(image_url, headers=headers)
            with open(filepath, 'wb') as f:
                f.write(img_r.content)
            print(f"[{id}] Downloaded!")
        else:
            print(f"[{id}] No image found.")
    except Exception as e:
        print(f"[{id}] Error: {e}")
        
    time.sleep(1)
