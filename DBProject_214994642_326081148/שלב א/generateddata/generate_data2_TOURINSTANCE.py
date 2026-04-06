import random
from datetime import datetime, timedelta

# --- הגדרות בסיסיות ---
NUM_RECORDS = 20000
OUTPUT_FILE = "TOURINSTANCE.sql"

# --- רשימות ה-IDs הקיימים (ודאו שזה תואם למה שיצרתן ב-Mockaroo) ---
# נניח שיצרתן 500 מדריכים ב-Mockaroo
guide_ids = list(range(1, 501)) 

# רשימת שמות הסיורים (חייב להיות זהה למה שיש בטבלת TOUR)
tour_names = [
    "City Pulse Walk", "Urban Legends Tour", "The Concrete Jungle", "Skyline Spectacle", "Metro Magic",
    "Hidden Alleys", "Downtown Discovery", "The Grand Boulevard", "City Lights & Nights", "Street Smart Saunter",
    "Pavement Perspectives", "The Landmark Loop", "Central Circuit", "Borough Best", "District Delights",
    "Capital Chronicles", "Metropolitan Mosaic", "Sky-High Views", "Main Street Memories", "The Vibrant Village",
    "Town Square Tales", "Avenue Adventures", "Modern Metropolis", "The City Soul", "Urban Oasis Hunt",
    "Neighborhood Nuances", "The Daily Grind", "Sidewalk Stories", "Crosswalk Culture", "Public Plaza Parade",
    "The Architectural Arc", "Skyline Shadows", "Neon Nights", "Brick & Mortar", "The City Core",
    "Waterfront Wonders", "Dockside Dreams", "Pier Perspectives", "Harbor Highlights", "Bridge & Tunnel",
    "The High-Rise Hike", "Alleyway Aesthetics", "Subway Secrets", "Transit Triumphs", "Park & Promenade",
    "The Civic Center", "Cultural Quarter", "Entertainment District", "Financial Frontier", "Old Town Origins",
    "Heritage Highlights", "Ancient Echoes", "Timeless Traditions", "The Legacy Path", "Roots & Routes",
    "History Unveiled", "Past Perfect", "Ancestral Avenues", "Cultural Crossroads", "The Folklore Follow",
    "Dynasty Discovery", "Empire Eras", "Medieval Mysteries", "Renaissance Revelations", "Colonial Chronicles",
    "Landmark Lore", "The Museum Mile", "Monumental Moments", "Sacred Sites", "Temple Trails",
    "Cathedral Corners", "Fortress Finds", "Castle Conquest", "Palace Perspectives", "Ruins & Relics",
    "Antique Adventures", "The Golden Age", "Vintage Voyage", "Retro Road", "Classic Culture",
    "The Patriot Path", "Liberty Lane", "Freedom Frontier", "War & Peace Walk", "Industrial Icons",
    "Victorian Views", "Baroque Beauty", "Gothic Glories", "Ancient Artifacts", "Tribal Tracks",
    "Indigenous Insight", "The Tradition Trail", "Masterpiece Morning", "Gallery Gazing", "Curated Culture",
    "Heritage Hues", "The History Hut", "Epoch Explorations", "Century Circuit", "Time Traveler’s Trek",
    "Wild Wanderer", "Nature’s Nook", "Forest Frontiers", "Mountain Majesty", "Valley Views",
    "Canyon Conquest", "River Rapids", "Lake Liberty", "Ocean Odysseys", "Coastal Currents",
    "Island Intervals", "Jungle Jaunt", "Safari Solitude", "Desert Dreams", "Oasis Observations",
    "Summit Seekers", "Trailblazer Tracks", "Backcountry Bliss", "Wilderness Way", "Flora & Fauna",
    "Botanical Best", "Garden Glimpse", "Bloom & Blossom", "Sunrise Safari", "Sunset Serenity",
    "Starlight Sojourn", "Moonlight Meadow", "Eco-Explorer", "Green Getaway", "Sustainable Steps",
    "The Great Outdoors", "Peak Performance", "Ridge Runner", "Meadow Muse", "Waterfall Wonders",
    "Stream Side Saunter", "Marshland Magic", "Coastal Cliffs", "Sandy Shores", "Reef Revelations",
    "Arctic Adventures", "Tundra Trails", "Savanna Stroll", "Rainforest Rhythms", "Woodland Walk",
    "Pine Path", "Highland Hike", "Lowland Loop", "Earthly Escapes", "Horizon Hunt",
    "Taste Buds Tour", "Culinary Conquest", "Gourmet Gazette", "Flavor Fusion", "Savory Steps",
    "Sweet Street", "Pastry Path", "Baker’s Best", "The Spice Route", "Market Munchies",
    "Farm to Fork", "Vineyard Voyage", "Winery Wonders", "Brewery Best", "Pub Crawl Classics",
    "Coffee Culture", "Tea Time Trails", "Street Food Safari", "Local Larder", "Chef’s Choice",
    "Kitchen Kingdom", "Epicurean Escape", "The Tasting Table", "Gastronomy Guide", "Artisan Appetizers",
    "Cheese Circuit", "Chocolate Chaser", "Dessert Discovery", "Seafood Sojourn", "BBQ Belt",
    "Vegan Ventures", "Organic Outing", "Exotic Eats", "Traditional Tastes", "Fusion Finds",
    "Brunch Bunch", "Dinner District", "Morning Morsels", "Nightcap Nibbles", "Picnic Parade",
    "Orchard Outing", "Berry Best", "Harvest Highlights", "Fermentation Find", "Distilled Dreams",
    "Sommelier’s Secret", "Tapas Trek", "Noodle Night", "Pizza Path", "The Full Plate",
    "Artistic Avenues", "Creative Corners", "Mural Magic", "Graffiti Gaze", "Sculpture Safari",
    "Studio Steps", "Gallery Glow", "Masterpiece Muse", "Design District", "Crafty Circuit",
    "Canvas Culture", "Palette Path", "Brushstroke Best", "Abstract Adventures", "Surrealism Sojourn",
    "Modern Muse", "Classic Canvas", "Portrait Parade", "Landscape Lore", "Photography Phantoms",
    "Snapshot Safari", "Visual Voyage", "Aesthetic Arc", "Color Conquest", "Pattern Path",
    "Texture Trails", "Artisan Alley", "Maker’s Mile", "Handcrafted Highlights", "Pottery Path",
    "Textile Trek", "Fashion Frontier", "Runway Routes", "Style Saunter", "Vogue Voyage",
    "Cinema Circuit", "Hollywood Hunt", "Film Frame Follow", "Musical Magic", "Rhythm Routes",
    "Jazz Jaunt", "Rock & Roll Road", "Operatic Odyssey", "Theater Thrills", "Broadway Best",
    "Backstage Bliss", "Performance Path", "Creative Currents", "Inspiration Island", "Visionary Views",
    "Ghostly Gaze", "Haunted Highlights", "Phantom Path", "Mystery Mile", "Shadow Sojourn",
    "Midnight Murmurs", "Cryptic Circuit", "Dark District", "Eerie Echoes", "Spooky Steps",
    "Spirits of the Past", "Legend Lore", "Mythic Moments", "Twilight Trails", "After Dark Adventures",
    "Moonlit Mysteries", "Foggy Frontier", "Chilling Chronicles", "Paranormal Parade", "Supernatural Saunter",
    "Gothic Ghost Walk", "Cemetery Secrets", "Tombstone Tales", "Ancient Anathemata", "Forbidden Finds",
    "Secret Societies", "Hidden History", "Masked Magic", "Illusion Island", "Enigma Escape",
    "Puzzling Path", "Riddle Routes", "Crime & Consequence", "Detective District", "Noir Night",
    "Sleuth Steps", "Underworld Unveiled", "Rogue Roads", "Outlaw Odysseys", "Pirate’s Path",
    "Smuggler’s Secret", "Bandit Best", "Cursed Corners", "Bewitched Boulevard", "Sorcerer’s Sojourn",
    "Alchemist’s Arc", "Mystical Muse", "Oracle Outing", "Tarot Trails", "Zodiac Zigzag",
    "Pedal Power", "Cycle Circuit", "Bike & Brew", "Two-Wheel Trek", "Rolling Routes",
    "Jogger’s Jaunt", "Marathon Mile", "Sprint Steps", "Active Adventures", "Fitness Frontier",
    "Wellness Walk", "Yoga Yard", "Zen Zone", "Mindful Movements", "Serenity Steps",
    "Kayak Quest", "Paddle Path", "Surf & Sand", "Sail Away", "Nautical Night",
    "Skateboard Safari", "Rollerblade Routes", "Climb & Conquer", "Bouldering Best", "High-Wire Hike",
    "Zip-Line Zeal", "Paraglide Path", "Balloon Best", "Aerial Adventures", "Skydiving Sojourn",
    "Deep Sea Discovery", "Snorkel Steps", "Scuba Safari", "Underwater Universe", "Snowshoe Sojourn",
    "Ski Slope Safari", "Ice Rink Routes", "Winter Wonderland", "Sporty Spectacle", "Stadium Stars",
    "Arena Arc", "Game Day Glimpse", "Fan Frontier", "Goal Line Gaze", "Court Side Circuit",
    "Pitch Perspectives", "Olympic Odyssey", "Champion’s Choice", "Victory Voyage", "Endurance Escape",
    "Family Fun Fest", "Kid-Friendly Kingdom", "Playful Path", "Toy Town Tour", "Magic Mile",
    "Wonderland Walk", "Fantasy Frontier", "Fairy Tale Follow", "Storybook Steps", "Animal Adventures",
    "Zoo Zone", "Aquarium Arc", "Petting Path", "Wildlife Watch", "Picnic Party",
    "Playground Parade", "Carnival Circuit", "Fairground Finds", "Theme Park Thrills", "Rollercoaster Routes",
    "Candy Cane Lane", "Sweet Shop Sojourn", "Ice Cream Island", "Balloon Boulevard", "Circus Celebrations",
    "Puppet Parade", "Toy Box Trek", "Game On Garden", "Puzzle Park", "Maze Magic",
    "Science Secrets", "Discovery District", "Inventor’s Island", "Robot Routes", "Space Safari",
    "Planetarium Path", "Rocket Road", "Dino Discovery", "Fossil Find", "Prehistoric Path",
    "Knight’s Quest", "Princess Parade", "Wizard’s Walk", "Superhero Steps", "Cartoon Circuit",
    "Hobby Horse Hunt", "Kite Krusade", "Bubble Boulevard", "Treasure Trove", "Gold Mine Gaze",
    "Luxury Lane", "Elegant Escapes", "Posh Path", "Diamond District", "Golden Glimpse",
    "Velvet Voyage", "Silk Road Saunter", "High Society Sojourn", "Boutique Best", "Retail Revelations",
    "Shopaholic Safari", "Window Shopping Walk", "Fashion Forward", "Glamour Gaze", "Spa Serenity",
    "Wellness Wonders", "Retreat Routes", "Relaxation Road", "Tranquility Trail", "Bliss Boulevard",
    "Resort Revelations", "Hotel Highlights", "Manor Muse", "Estate Explorations", "Mansion Magic",
    "Penthouse Perspectives", "Yacht Yard", "Limousine Lore", "First Class Follow", "Elite Escapades",
    "Private Paradise", "Exclusive Echoes", "Hidden Gems", "Secret Sanctuary", "Quiet Quarters",
    "Peaceful Path", "Serene Sojourn", "Calm Currents", "Gentle Gaze", "Leisurely Loop",
    "Slow Lane Saunter", "Easy Breezy", "Sunny Side Up", "Carefree Circuit", "Happy Hour Hunt",
    "Sunset Spirits", "Twilight Toast", "Evening Elegance", "Nightfall Nuances", "Dreamy Destinations",
    "Oddity Odyssey", "Peculiar Path", "Strange Steps", "Weird & Wonderful", "Curious Circuit",
    "Bizarre Boulevard", "Offbeat Outing", "Quirky Quarters", "Unusual Universe", "Rare Routes",
    "Eccentric Escapes", "Funky Frontier", "Retro Revival", "Kitsch Kingdom", "Vintage Vibes",
    "Thrift Shop Trek", "Flea Market Follow", "Antique Arc", "Curiosities Circuit", "Collector’s Choice",
    "Nerd Night", "Geek Gaze", "Tech Trek", "Digital District", "Startup Safari",
    "Innovation Island", "Future Frontiers", "Sci-Fi Sojourn", "Steampunk Steps", "Cyber Circuit",
    "Street Art Safari", "Vinyl Voyage", "Record Road", "Bookworm Boulevard", "Library Lore",
    "Literary Legend", "Writer’s Walk", "Poet’s Path", "Language Lab", "Polyglot Parade",
    "Math Magic", "Geometry Gaze", "Pattern Path", "Soundscape Safari", "Acoustic Adventures",
    "Echo Exploration", "Shadow Steps", "Reflection Routes", "Mirror Magic", "Final Frontier"
]

def generate_instances():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("-- Auto-generated 20,000 Tour Instances\n\n")
        
        for i in range(1, NUM_RECORDS + 1):
            t_i_id = i  # ה-ID של המופע
            
            # הגרלת תאריך (במהלך שנת 2026)
            random_days = random.randint(0, 365)
            t_date = datetime(2026, 1, 1) + timedelta(days=random_days)
            
            # הגרלת שעות (פורמט HH:MM:SS)
            start_hour = random.randint(8, 16) # מתחיל בין 8 בבוקר ל-4 אחה"צ
            duration = random.randint(2, 5)    # אורך הסיור בין 2 ל-5 שעות
            
            start_time = f"{start_hour:02}:00:00"
            end_time = f"{(start_hour + duration):02}:00:00"
            
            # בחירת מדריך וסיור מהרשימות שלנו
            g_id = random.choice(guide_ids)
            t_name = random.choice(tour_names)
            
            # יצירת שורת ה-SQL
            # שימו לב לגרשיים סביב התאריך, השעות ושם הסיור (כי הם VARCHAR/DATE/TIME)
            sql_line = f"INSERT INTO TOURINSTANCE (t_i_ID, t_date, start_time, end_time, g_ID, t_name) " \
                       f"VALUES ({t_i_id}, '{t_date.date()}', '{start_time}', '{end_time}', {g_id}, '{t_name}');\n"
            
            f.write(sql_line)
            
    print(f"Success! Created {OUTPUT_FILE} with {NUM_RECORDS} records.")

if __name__ == "__main__":
    generate_instances()