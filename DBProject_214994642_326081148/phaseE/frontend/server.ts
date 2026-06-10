import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("tours_v2.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration_hours INTEGER, -- t_during
    type TEXT DEFAULT 'Sightseeing', -- t_type
    difficulty_level INTEGER, -- level
    sociability_level INTEGER, -- level
    accessibility TEXT,
    area TEXT,
    base_price REAL, -- price
    base_max_participants INTEGER, -- max_participants
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- s_name
    address TEXT, -- address
    description TEXT -- description
  );

  CREATE TABLE IF NOT EXISTS route_stations (
    route_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    order_index INTEGER, -- index
    duration_minutes INTEGER, -- s_during
    PRIMARY KEY (route_id, station_id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (station_id) REFERENCES stations(id)
  );

  CREATE TABLE IF NOT EXISTS guides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_number TEXT UNIQUE, -- g_ID
    first_name TEXT NOT NULL, -- g_first_name
    last_name TEXT NOT NULL, -- g_last_name
    email TEXT UNIQUE, -- g_email
    phone TEXT, -- g_phone
    certification_school TEXT -- school
  );

  CREATE TABLE IF NOT EXISTS tour_instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- t_i_ID
    route_id INTEGER NOT NULL,
    guide_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- t_date
    start_time TEXT, -- start_time
    end_time TEXT, -- end_time
    max_participants INTEGER DEFAULT 20,
    price_per_person REAL NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (guide_id) REFERENCES guides(id)
  );

  CREATE TABLE IF NOT EXISTS tour_instance_stations (
    tour_instance_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    order_index INTEGER, -- index
    duration_minutes INTEGER, -- s_during
    PRIMARY KEY (tour_instance_id, station_id),
    FOREIGN KEY (tour_instance_id) REFERENCES tour_instances(id),
    FOREIGN KEY (station_id) REFERENCES stations(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_number TEXT UNIQUE, -- c_ID
    first_name TEXT NOT NULL, -- c_first_name
    last_name TEXT NOT NULL, -- c_last_name
    email TEXT UNIQUE NOT NULL, -- c_email
    phone TEXT -- c_phone
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- b_ID
    tour_instance_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    num_participants INTEGER NOT NULL, -- amount_people
    total_price REAL, -- total_price
    booking_date TEXT DEFAULT CURRENT_TIMESTAMP, -- b_date
    status TEXT DEFAULT 'Confirmed', -- status
    FOREIGN KEY (tour_instance_id) REFERENCES tour_instances(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT NOT NULL,
    account_number TEXT,
    bank_number TEXT,
    card_number TEXT,
    expiry_date TEXT,
    cvv TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
  );
`);

// Seed some initial data if empty
try {
  db.prepare("ALTER TABLE tour_instances ADD COLUMN start_time TEXT").run();
  db.prepare("ALTER TABLE tour_instances ADD COLUMN end_time TEXT").run();
} catch (e) {
  // Columns might already exist
}
const routeCount = db.prepare("SELECT COUNT(*) as count FROM routes").get() as { count: number };

// Ensure the Old City Jerusalem route has the correct image and description if it already exists
db.prepare(`
  UPDATE routes 
  SET description = ?, duration_hours = ?, image_url = ?
  WHERE name = ? OR name LIKE '%Jerusalem%'
`).run(
  "A journey through time in the holy city. We will enter through Jaffa Gate, visit the sacred Western Wall in the Jewish Quarter, and explore the historic Church of the Holy Sepulchre.",
  4,
  "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80",
  "Old City Jerusalem"
);

if (routeCount.count === 0) {
  // 3 Sightseeing
  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, sociability_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Old City Jerusalem", "A journey through time in the holy city. We will enter through Jaffa Gate, visit the sacred Western Wall in the Jewish Quarter, and explore the historic Church of the Holy Sepulchre.", 4, "Sightseeing", 5, "Partial", "Jerusalem", 150, 20, "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80");
  
  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, sociability_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Tel Aviv Foodie", "A culinary adventure in the heart of Tel Aviv. Starting at Carmel Market, we'll discover exotic spices and taste the city's most famous authentic hummus.", 3, "Sightseeing", 4, "Full", "Tel Aviv", 120, 15, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80");

  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, sociability_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Eilat Coral Reef", "Explore the Red Sea's hidden treasures. Visit the Underwater Observatory to see marine life up close and enjoy a guided snorkeling session among vibrant corals.", 2, "Sightseeing", 3, "Limited", "Eilat", 180, 10, "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80");

  // 3 Hiking
  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, difficulty_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Masada Sunrise", "Experience the desert's magic at dawn. Hike the ancient Snake Path under the stars to witness a breathtaking sunrise from the summit and explore Herod's fortress.", 8, "Hiking", 4, "None", "Dead Sea", 250, 25, "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?auto=format&fit=crop&w=800&q=80");

  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, difficulty_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Galilee Trails", "Walk through the lush landscapes of the North. Enjoy panoramic views from Mount Arbel and visit the historic ruins of Capernaum on the shores of the Kinneret.", 6, "Hiking", 3, "None", "Galilee", 200, 15, "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80");

  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, difficulty_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Golan Heights", "Discover volcanic peaks and rushing water. Take in the strategic views from Mount Bental and feel the power of the Banias, Israel's most impressive waterfall.", 5, "Hiking", 4, "None", "Golan", 220, 12, "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80");

  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, sociability_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Bahai Gardens Haifa", "A peaceful stroll through world-renowned beauty. Admire the perfectly manicured terraces from the upper viewpoint and visit the iconic golden-domed Shrine of the Bab.", 2, "Sightseeing", 4, "Partial", "Haifa", 100, 30, "https://images.unsplash.com/photo-1590429119059-2aa772277028?auto=format&fit=crop&w=800&q=80");

  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, sociability_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Dead Sea Relaxation", "The ultimate natural spa day. Float effortlessly in the salt-rich waters of Ein Gedi Beach and rejuvenate your skin with a therapeutic Dead Sea mud bath.", 5, "Sightseeing", 3, "Full", "Dead Sea", 140, 40, "https://images.unsplash.com/photo-1552423114-75d517c89016?auto=format&fit=crop&w=800&q=80");

  db.prepare(`
    INSERT INTO routes (name, description, duration_hours, type, difficulty_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Ramon Crater Hike", "Journey into the heart of the world's largest erosion crater. Learn about its unique geology at the visitor center before hiking across the colorful crater floor.", 7, "Hiking", 5, "None", "Negev", 280, 12, "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80");

  // Seed stations
  const stationsData = [
    { name: "Jaffa Gate", address: "Old City Entrance", description: "Historical entrance to the city" },
    { name: "Western Wall", address: "Jewish Quarter", description: "Holiest site for Jewish people" },
    { name: "Church of the Holy Sepulchre", address: "Christian Quarter", description: "Traditional site of Jesus' crucifixion" },
    { name: "The Cardo", address: "Jewish Quarter", description: "Ancient Roman main street" },
    { name: "Hurva Synagogue", address: "Jewish Quarter", description: "Iconic reconstructed synagogue" },
    { name: "Carmel Market Entrance", address: "Allenby St", description: "Start of the culinary journey" },
    { name: "Spice Shop", address: "Market Center", description: "Aromatic experience with local spices" },
    { name: "Hummus Place", address: "Market Alley", description: "Tasting the best local hummus" },
    { name: "Neve Tzedek", address: "South Tel Aviv", description: "First Jewish neighborhood outside Jaffa" },
    { name: "Rothschild Blvd", address: "City Center", description: "Bauhaus architecture and history" },
    { name: "Underwater Observatory", address: "Coral Beach", description: "View marine life without getting wet" },
    { name: "Coral Beach Snorkeling", address: "Red Sea", description: "Swim among vibrant corals and fish" },
    { name: "Dolphin Reef", address: "Southern Beach", description: "Observe dolphins in their natural habitat" },
    { name: "Eilat Promenade", address: "North Beach", description: "Vibrant shopping and dining area" },
    { name: "Snake Path Base", address: "Dead Sea Road", description: "Beginning the ascent in the dark" },
    { name: "Masada Summit", address: "Top of the Mountain", description: "Watching the sunrise over the Moab mountains" },
    { name: "Herodian Palace", address: "Northern Edge", description: "Exploring the ancient fortress ruins" },
    { name: "Roman Ramp", address: "Western Side", description: "The siege ramp built by the Romans" },
    { name: "Northern Palace", address: "Cliff Edge", description: "King Herod's private residence" },
    { name: "Mount Arbel", address: "Arbel National Park", description: "Breathtaking views of the Sea of Galilee" },
    { name: "Capernaum", address: "North Shore", description: "Visiting the ancient fishing village" },
    { name: "Tabgha", address: "Northwest Shore", description: "Site of the miracle of loaves and fishes" },
    { name: "Mount of Beatitudes", address: "Above Kinneret", description: "Traditional site of the Sermon on the Mount" },
    { name: "Mount Bental", address: "Central Golan", description: "Old bunker with views into Syria" },
    { name: "Banias Waterfall", address: "Hermon Stream", description: "The most powerful waterfall in Israel" },
    { name: "Nimrod Fortress", address: "Mount Hermon", description: "Largest medieval fortress in Israel" },
    { name: "Odem Forest", address: "Northern Golan", description: "Unique oak forest and volcanic craters" },
    { name: "Upper Terrace", address: "Panorama Rd", description: "Panoramic view of the bay and gardens" },
    { name: "Shrine of the Bab", address: "Middle Terrace", description: "The golden-domed landmark of Haifa" },
    { name: "German Colony", address: "Ben Gurion Blvd", description: "Restored 19th-century Templer houses" },
    { name: "Stella Maris", address: "Mount Carmel", description: "Carmelite monastery with stunning views" },
    { name: "Ein Gedi Beach", address: "Dead Sea Shore", description: "Floating in the mineral-rich waters" },
    { name: "Mud Bath Area", address: "Spa Zone", description: "Natural therapeutic mud experience" },
    { name: "Qumran Caves", address: "Northern Dead Sea", description: "Where the Dead Sea Scrolls were found" },
    { name: "Ahava Factory", address: "Mitzpe Shalem", description: "Dead Sea mineral cosmetics center" },
    { name: "Visitor Center", address: "Mitzpe Ramon", description: "Interactive museum about the crater" },
    { name: "Crater Floor", address: "Negev Desert", description: "Hiking through unique geological formations" },
    { name: "The Sawmill", address: "Crater Center", description: "Unique prism-shaped rock formations" },
    { name: "Ammonite Wall", address: "Southern Crater", description: "Fossilized marine life in the desert" },
    { name: "Red Canyon", address: "Eilat Mountains", description: "Stunning natural red sandstone formations" },
    { name: "Sea of Galilee Boat Ride", address: "Tiberias Pier", description: "Traditional wooden boat experience" },
    { name: "Mount Hermon Viewpoint", address: "Golan Heights", description: "Highest peak in Israel with snowy views" },
    { name: "Haifa Port View", address: "Louis Promenade", description: "Stunning night views of the Mediterranean" },
    { name: "Ein Gedi Nature Reserve", address: "Dead Sea Oasis", description: "Desert waterfalls and local wildlife" },
    { name: "Star Gazing Spot", address: "Ramon Crater Edge", description: "One of the best places for astronomy" },
    { name: "Tower of David", address: "Jaffa Gate", description: "Ancient citadel and museum of Jerusalem's history" },
    { name: "Tel Aviv Port", address: "North Tel Aviv", description: "Vibrant entertainment and shopping district" },
    { name: "Timna Park", address: "Arava Desert", description: "Ancient copper mines and unique rock formations" },
    { name: "Masada Museum", address: "Visitor Center", description: "Artifacts and history of the Masada siege" },
    { name: "Yardenit Baptismal Site", address: "Jordan River", description: "Sacred site for Christian pilgrims" },
    { name: "Majdal Shams Market", address: "Northern Golan", description: "Authentic Druze market and local food" },
    { name: "Clandestine Immigration Museum", address: "Haifa Coast", description: "History of Jewish immigration to Israel" },
    { name: "Dead Sea Panorama", address: "Dead Sea Road", description: "Stunning viewpoints over the salt lake" },
    { name: "Alpaca Farm", address: "Mitzpe Ramon", description: "Unique farm with alpacas and desert views" }
  ];

  for (const s of stationsData) {
    db.prepare("INSERT OR IGNORE INTO stations (name, address, description) VALUES (?, ?, ?)").run(s.name, s.address, s.description);
  }

  // Helper to get station ID by name
  const getStationId = (name: string) => (db.prepare("SELECT id FROM stations WHERE name = ?").get(name) as any).id;

  // Route 1 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(1, getStationId("Jaffa Gate"), 1, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(1, getStationId("Tower of David"), 2, 45);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(1, getStationId("The Cardo"), 3, 40);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(1, getStationId("Hurva Synagogue"), 4, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(1, getStationId("Western Wall"), 5, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(1, getStationId("Church of the Holy Sepulchre"), 6, 60);

  // Route 2 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(2, getStationId("Carmel Market Entrance"), 1, 20);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(2, getStationId("Spice Shop"), 2, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(2, getStationId("Hummus Place"), 3, 45);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(2, getStationId("Neve Tzedek"), 4, 40);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(2, getStationId("Rothschild Blvd"), 5, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(2, getStationId("Tel Aviv Port"), 6, 45);

  // Route 3 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(3, getStationId("Underwater Observatory"), 1, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(3, getStationId("Coral Beach Snorkeling"), 2, 90);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(3, getStationId("Dolphin Reef"), 3, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(3, getStationId("Eilat Promenade"), 4, 45);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(3, getStationId("Red Canyon"), 5, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(3, getStationId("Timna Park"), 6, 90);

  // Route 4 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(4, getStationId("Snake Path Base"), 1, 10);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(4, getStationId("Masada Summit"), 2, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(4, getStationId("Herodian Palace"), 3, 45);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(4, getStationId("Roman Ramp"), 4, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(4, getStationId("Northern Palace"), 5, 40);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(4, getStationId("Masada Museum"), 6, 45);

  // Route 5 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(5, getStationId("Mount Arbel"), 1, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(5, getStationId("Capernaum"), 2, 45);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(5, getStationId("Tabgha"), 3, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(5, getStationId("Mount of Beatitudes"), 4, 40);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(5, getStationId("Sea of Galilee Boat Ride"), 5, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(5, getStationId("Yardenit Baptismal Site"), 6, 45);

  // Route 6 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(6, getStationId("Mount Bental"), 1, 40);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(6, getStationId("Banias Waterfall"), 2, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(6, getStationId("Nimrod Fortress"), 3, 50);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(6, getStationId("Odem Forest"), 4, 40);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(6, getStationId("Mount Hermon Viewpoint"), 5, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(6, getStationId("Majdal Shams Market"), 6, 45);

  // Route 7 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(7, getStationId("Upper Terrace"), 1, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(7, getStationId("Shrine of the Bab"), 2, 40);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(7, getStationId("German Colony"), 3, 45);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(7, getStationId("Stella Maris"), 4, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(7, getStationId("Haifa Port View"), 5, 20);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(7, getStationId("Clandestine Immigration Museum"), 6, 40);

  // Route 8 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(8, getStationId("Ein Gedi Beach"), 1, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(8, getStationId("Mud Bath Area"), 2, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(8, getStationId("Qumran Caves"), 3, 45);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(8, getStationId("Ahava Factory"), 4, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(8, getStationId("Ein Gedi Nature Reserve"), 5, 90);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(8, getStationId("Dead Sea Panorama"), 6, 30);

  // Route 9 Stations
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(9, getStationId("Visitor Center"), 1, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(9, getStationId("Crater Floor"), 2, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(9, getStationId("The Sawmill"), 3, 30);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(9, getStationId("Ammonite Wall"), 4, 40);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(9, getStationId("Star Gazing Spot"), 5, 60);
  db.prepare("INSERT OR IGNORE INTO route_stations (route_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(9, getStationId("Alpaca Farm"), 6, 45);

  db.prepare("INSERT INTO guides (id_number, first_name, last_name, email, phone, certification_school) VALUES (?, ?, ?, ?, ?, ?)").run("G101", "Avi", "Cohen", "avi@tours.com", "050-1234567", "Hebrew University");
  db.prepare("INSERT INTO guides (id_number, first_name, last_name, email, phone, certification_school) VALUES (?, ?, ?, ?, ?, ?)").run("G102", "Sarah", "Levi", "sarah@tours.com", "052-7654321", "Zionist Federation");
  db.prepare("INSERT INTO guides (id_number, first_name, last_name, email, phone, certification_school) VALUES (?, ?, ?, ?, ?, ?)").run("G103", "Dana", "Levi", "dana@tours.com", "050-1112223", "Tel Aviv University");
  db.prepare("INSERT INTO guides (id_number, first_name, last_name, email, phone, certification_school) VALUES (?, ?, ?, ?, ?, ?)").run("G104", "Noam", "Barak", "noam@tours.com", "054-9998887", "Bishulim");

  const instances = [
    { route_id: 1, guide_id: 1, date: "2026-04-15", start_time: "09:00", end_time: "13:00", max_participants: 15, price_per_person: 150 },
    { route_id: 2, guide_id: 2, date: "2026-04-20", start_time: "10:00", end_time: "13:00", max_participants: 20, price_per_person: 250 },
    { route_id: 3, guide_id: 3, date: "2026-04-10", start_time: "11:00", end_time: "13:00", max_participants: 10, price_per_person: 120 },
    { route_id: 4, guide_id: 4, date: "2026-05-20", start_time: "04:00", end_time: "12:00", max_participants: 15, price_per_person: 200 },
    { route_id: 1, guide_id: 4, date: "2026-07-15", start_time: "08:30", end_time: "12:30", max_participants: 20, price_per_person: 160 },
    { route_id: 2, guide_id: 3, date: "2026-08-05", start_time: "10:30", end_time: "13:30", max_participants: 12, price_per_person: 240 },
    { route_id: 1, guide_id: 2, date: "2026-05-10", start_time: "09:00", end_time: "13:00", max_participants: 12, price_per_person: 180 },
    { route_id: 2, guide_id: 1, date: "2026-06-05", start_time: "10:00", end_time: "13:00", max_participants: 25, price_per_person: 220 },
    { route_id: 7, guide_id: 2, date: "2026-04-25", start_time: "14:00", end_time: "16:00", max_participants: 30, price_per_person: 100 },
    { route_id: 8, guide_id: 3, date: "2026-05-15", start_time: "11:00", end_time: "16:00", max_participants: 40, price_per_person: 140 },
    { route_id: 5, guide_id: 2, date: "2026-06-10", start_time: "08:00", end_time: "14:00", max_participants: 15, price_per_person: 180 },
    { route_id: 6, guide_id: 3, date: "2026-07-05", start_time: "09:00", end_time: "14:00", max_participants: 12, price_per_person: 300 },
    { route_id: 9, guide_id: 1, date: "2026-08-15", start_time: "07:00", end_time: "14:00", max_participants: 10, price_per_person: 350 },
    { route_id: 9, guide_id: 1, date: "2026-06-10", start_time: "07:30", end_time: "14:30", max_participants: 12, price_per_person: 280 },
    { route_id: 1, guide_id: 3, date: "2026-05-25", start_time: "09:30", end_time: "13:30", max_participants: 20, price_per_person: 150 },
    { route_id: 4, guide_id: 2, date: "2026-06-20", start_time: "04:30", end_time: "12:30", max_participants: 25, price_per_person: 250 },
    { route_id: 5, guide_id: 4, date: "2026-07-10", start_time: "08:30", end_time: "14:30", max_participants: 15, price_per_person: 200 },
    { route_id: 6, guide_id: 1, date: "2026-08-15", start_time: "09:30", end_time: "14:30", max_participants: 12, price_per_person: 220 },
  ];

  for (const inst of instances) {
    const result = db.prepare("INSERT INTO tour_instances (route_id, guide_id, date, start_time, end_time, max_participants, price_per_person) VALUES (?, ?, ?, ?, ?, ?, ?)").run(inst.route_id, inst.guide_id, inst.date, inst.start_time, inst.end_time, inst.max_participants, inst.price_per_person);
    const tourInstanceId = result.lastInsertRowid;
    
    // Copy stations from route to instance
    const routeStations = db.prepare("SELECT * FROM route_stations WHERE route_id = ?").all(inst.route_id) as any[];
    for (const rs of routeStations) {
      db.prepare("INSERT INTO tour_instance_stations (tour_instance_id, station_id, order_index, duration_minutes) VALUES (?, ?, ?, ?)").run(tourInstanceId, rs.station_id, rs.order_index, rs.duration_minutes);
    }
  }

  db.prepare("INSERT INTO customers (id_number, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)").run("C001", "Ruth", "Student", "rut.kalimi@gmail.com", "054-0000000");
  db.prepare("INSERT INTO customers (id_number, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)").run("C002", "Shirel", "Friend", "shirel@example.com", "054-1111111");
  db.prepare("INSERT INTO customers (id_number, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)").run("C003", "David", "Cohen", "david@example.com", "052-1111111");
  db.prepare("INSERT INTO customers (id_number, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)").run("C004", "Michal", "Levi", "michal@example.com", "053-2222222");
  db.prepare("INSERT INTO customers (id_number, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)").run("C005", "Yossi", "Mizrahi", "yossi@example.com", "050-3333333");

  const bookingsData = [
    { tour_instance_id: 1, customer_id: 1, num_participants: 5, total_price: 150 * 5 },
    { tour_instance_id: 1, customer_id: 2, num_participants: 3, total_price: 150 * 3 },
    { tour_instance_id: 3, customer_id: 3, num_participants: 2, total_price: 120 * 2 },
    { tour_instance_id: 4, customer_id: 4, num_participants: 4, total_price: 200 * 4 },
    { tour_instance_id: 5, customer_id: 5, num_participants: 1, total_price: 160 * 1 },
    { tour_instance_id: 6, customer_id: 3, num_participants: 3, total_price: 240 * 3 },
    { tour_instance_id: 3, customer_id: 1, num_participants: 2, total_price: 120 * 2 },
    { tour_instance_id: 8, customer_id: 2, num_participants: 4, total_price: 100 * 4 },
    { tour_instance_id: 9, customer_id: 3, num_participants: 2, total_price: 140 * 2 },
    { tour_instance_id: 10, customer_id: 4, num_participants: 3, total_price: 280 * 3 },
    { tour_instance_id: 11, customer_id: 5, num_participants: 2, total_price: 150 * 2 },
    { tour_instance_id: 12, customer_id: 1, num_participants: 6, total_price: 250 * 6 },
  ];

  for (const b of bookingsData) {
    const result = db.prepare("INSERT INTO bookings (tour_instance_id, customer_id, num_participants, total_price) VALUES (?, ?, ?, ?)").run(b.tour_instance_id, b.customer_id, b.num_participants, b.total_price);
    const bookingId = result.lastInsertRowid;
    db.prepare("INSERT INTO payments (booking_id, amount, payment_method) VALUES (?, ?, ?)").run(bookingId, b.total_price, "Credit Card");
  }
}

// Ensure Jerusalem image is updated even if already seeded
db.prepare("UPDATE routes SET image_url = ?, description = ? WHERE name = ?").run(
  "https://i.ibb.co/m5kzYh79/image.jpg",
  "A journey through time in the holy city. We will enter through Jaffa Gate, visit the sacred Western Wall in the Jewish Quarter, and explore the historic Church of the Holy Sepulchre.",
  "Old City Jerusalem"
);

// Force update the 3 new routes images as well
db.prepare("UPDATE routes SET image_url = ? WHERE name = ?").run(
  "https://picsum.photos/seed/haifa/800/800",
  "Bahai Gardens Haifa"
);
db.prepare("UPDATE routes SET image_url = ? WHERE name = ?").run(
  "https://picsum.photos/seed/deadsea/800/800",
  "Dead Sea Relaxation"
);
db.prepare("UPDATE routes SET image_url = ? WHERE name = ?").run(
  "https://picsum.photos/seed/ramon/800/800",
  "Ramon Crater Hike"
);

// Standalone inserts for existing databases to ensure the 3 new tours and instances appear
const checkNewRoutes = db.prepare("SELECT COUNT(*) as count FROM routes WHERE name IN ('Bahai Gardens Haifa', 'Dead Sea Relaxation', 'Ramon Crater Hike')").get() as { count: number };
if (checkNewRoutes.count < 3) {
  // Add missing routes
  db.prepare(`INSERT OR IGNORE INTO routes (name, description, duration_hours, type, sociability_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES ('Bahai Gardens Haifa', 'Stunning terraced gardens', 2, 'Sightseeing', 4, 'Partial', 'Haifa', 100, 30, 'https://images.unsplash.com/photo-1590429119059-2aa772277028?auto=format&fit=crop&w=800&q=80')`).run();
  db.prepare(`INSERT OR IGNORE INTO routes (name, description, duration_hours, type, sociability_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES ('Dead Sea Relaxation', 'Floating and mud bath experience', 5, 'Sightseeing', 3, 'Full', 'Dead Sea', 140, 40, 'https://images.unsplash.com/photo-1552423114-75d517c89016?auto=format&fit=crop&w=800&q=80')`).run();
  db.prepare(`INSERT OR IGNORE INTO routes (name, description, duration_hours, type, difficulty_level, accessibility, area, base_price, base_max_participants, image_url) 
    VALUES ('Ramon Crater Hike', 'Deep desert exploration', 7, 'Hiking', 5, 'None', 'Negev', 280, 12, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80')`).run();

  // Add more instances for these new routes and existing ones across months
  const haifaId = (db.prepare("SELECT id FROM routes WHERE name = 'Bahai Gardens Haifa'").get() as any).id;
  const deadSeaId = (db.prepare("SELECT id FROM routes WHERE name = 'Dead Sea Relaxation'").get() as any).id;
  const ramonId = (db.prepare("SELECT id FROM routes WHERE name = 'Ramon Crater Hike'").get() as any).id;

  db.prepare("INSERT INTO tour_instances (route_id, guide_id, date, max_participants, price_per_person) VALUES (?, ?, ?, ?, ?)").run(haifaId, 2, "2026-04-25", 30, 100);
  db.prepare("INSERT INTO tour_instances (route_id, guide_id, date, max_participants, price_per_person) VALUES (?, ?, ?, ?, ?)").run(deadSeaId, 3, "2026-05-15", 40, 140);
  db.prepare("INSERT INTO tour_instances (route_id, guide_id, date, max_participants, price_per_person) VALUES (?, ?, ?, ?, ?)").run(ramonId, 1, "2026-06-10", 12, 280);
  
  // Add some bookings for these new instances
  const lastInstanceId = (db.prepare("SELECT last_insert_rowid() as id").get() as any).id;
  db.prepare("INSERT INTO bookings (tour_instance_id, customer_id, num_participants) VALUES (?, ?, ?)").run(lastInstanceId, 1, 2);
  const lastBookingId = (db.prepare("SELECT last_insert_rowid() as id").get() as any).id;
  db.prepare("INSERT INTO payments (booking_id, amount, payment_method) VALUES (?, ?, ?)").run(lastBookingId, 280 * 2, "Credit Card");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/routes", (req, res) => {
    const routes = db.prepare("SELECT * FROM routes").all();
    console.log("Fetched routes:", routes.map(r => ({ name: r.name, image: r.image_url })));
    res.json(routes);
  });

  app.get("/api/routes/:id/stations", (req, res) => {
    const stations = db.prepare(`
      SELECT s.*, rs.order_index, rs.duration_minutes
      FROM stations s
      JOIN route_stations rs ON s.id = rs.station_id
      WHERE rs.route_id = ?
      ORDER BY rs.order_index ASC
    `).all(req.params.id);
    res.json(stations);
  });

  app.get("/api/tours/:id/stations", (req, res) => {
    const stations = db.prepare(`
      SELECT s.*, tis.order_index, tis.duration_minutes
      FROM stations s
      JOIN tour_instance_stations tis ON s.id = tis.station_id
      WHERE tis.tour_instance_id = ?
      ORDER BY tis.order_index ASC
    `).all(req.params.id);
    res.json(stations);
  });

  app.get("/api/tours", (req, res) => {
    const tours = db.prepare(`
      SELECT ti.*, r.name as route_name, r.type as route_type, 
      r.difficulty_level, r.sociability_level,
      g.first_name || ' ' || g.last_name as guide_name,
      (SELECT SUM(num_participants) FROM bookings WHERE tour_instance_id = ti.id AND status = 'Confirmed') as current_participants,
      (SELECT SUM(p.amount) FROM payments p JOIN bookings b ON p.booking_id = b.id WHERE b.tour_instance_id = ti.id AND b.status = 'Confirmed') as total_paid,
      (SELECT COUNT(*) FROM tour_instance_stations WHERE tour_instance_id = ti.id) as station_count,
      (SELECT SUM(duration_minutes) FROM tour_instance_stations WHERE tour_instance_id = ti.id) as total_duration_minutes
      FROM tour_instances ti
      JOIN routes r ON ti.route_id = r.id
      JOIN guides g ON ti.guide_id = g.id
      ORDER BY ti.date ASC
    `).all();
    res.json(tours);
  });

  app.get("/api/guides", (req, res) => {
    const guides = db.prepare("SELECT * FROM guides").all();
    res.json(guides);
  });

  app.get("/api/guides/:id", (req, res) => {
    const guide = db.prepare("SELECT * FROM guides WHERE id = ?").get(req.params.id);
    if (guide) {
      res.json(guide);
    } else {
      res.status(404).json({ error: "Guide not found" });
    }
  });

  app.post("/api/guides", (req, res) => {
    const { id_number, first_name, last_name, email, phone, certification_school } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO guides (id_number, first_name, last_name, email, phone, certification_school)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id_number, first_name, last_name, email, phone, certification_school);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/guides/:id", (req, res) => {
    const { id_number, first_name, last_name, email, phone, certification_school } = req.body;
    try {
      db.prepare(`
        UPDATE guides 
        SET id_number = ?, first_name = ?, last_name = ?, email = ?, phone = ?, certification_school = ?
        WHERE id = ?
      `).run(id_number, first_name, last_name, email, phone, certification_school, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/tours/:id/participants", (req, res) => {
    const participants = db.prepare(`
      SELECT b.num_participants, c.first_name, c.last_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.tour_instance_id = ? AND b.status = 'Confirmed'
    `).all(req.params.id);
    res.json(participants);
  });

  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers").all();
    res.json(customers);
  });

  app.post("/api/customers", (req, res) => {
    const { id_number, first_name, last_name, email, phone } = req.body;
    try {
      const result = db.prepare("INSERT INTO customers (id_number, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)").run(id_number, first_name, last_name, email, phone);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/bookings", (req, res) => {
    const bookings = db.prepare(`
      SELECT b.*, c.first_name, c.last_name, r.name as route_name, ti.date as tour_date
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN tour_instances ti ON b.tour_instance_id = ti.id
      JOIN routes r ON ti.route_id = r.id
    `).all();
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const { 
      tour_instance_id, 
      customer_id, 
      num_participants, 
      payment_method, 
      account_number, 
      bank_number,
      card_number,
      expiry_date,
      cvv
    } = req.body;
    
    const tour = db.prepare("SELECT price_per_person FROM tour_instances WHERE id = ?").get(tour_instance_id) as { price_per_person: number };
    const totalAmount = tour.price_per_person * num_participants;

    const transaction = db.transaction(() => {
      const bookingResult = db.prepare("INSERT INTO bookings (tour_instance_id, customer_id, num_participants, total_price) VALUES (?, ?, ?, ?)").run(tour_instance_id, customer_id, num_participants, totalAmount);
      const bookingId = bookingResult.lastInsertRowid;
      
      db.prepare(`
        INSERT INTO payments (booking_id, amount, payment_method, account_number, bank_number, card_number, expiry_date, cvv) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(bookingId, totalAmount, payment_method, account_number, bank_number, card_number, expiry_date, cvv);
      
      return bookingId;
    });

    try {
      const id = transaction();
      res.json({ id });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/stats", (req, res) => {
    const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM payments").get() as { total: number };
    const totalBookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get() as { count: number };
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM customers").get() as { count: number };
    
    res.json({
      revenue: totalRevenue.total || 0,
      bookings: totalBookings.count,
      customers: totalCustomers.count
    });
  });

  app.get("/api/stats/monthly-revenue", (req, res) => {
    const monthlyRevenue = db.prepare(`
      SELECT strftime('%Y-%m', ti.date) as month, SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN tour_instances ti ON b.tour_instance_id = ti.id
      GROUP BY month
      ORDER BY month ASC
    `).all();
    res.json(monthlyRevenue);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
