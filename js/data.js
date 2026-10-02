/* ============================================================
   Static sample data.
   NOTE: Transport timings, shop names/numbers and contact numbers
   below are illustrative placeholders for this demo, NOT verified
   real-world listings. In a real deployment, a Dumka college or
   local transport union would supply and update this data.
   National emergency numbers (112, 108, 100, 101, 1091) are the
   actual standardised Indian helpline numbers.
   ============================================================ */

const TRANSPORT_DATA = [
  { mode: "Bus", route: "Dumka → Ranchi", via: "via Jamtara / Deoghar", depart: "05:30 AM", duration: "~6 hr" },
  { mode: "Bus", route: "Dumka → Ranchi", via: "via Jamtara / Deoghar", depart: "09:00 PM (night)", duration: "~6 hr" },
  { mode: "Bus", route: "Dumka → Deoghar", via: "via Sarath", depart: "Every ~45 min, 06:00 AM–06:00 PM", duration: "~2 hr" },
  { mode: "Bus", route: "Dumka → Bhagalpur", via: "via Hansdiha", depart: "06:00 AM, 12:30 PM", duration: "~3 hr" },
  { mode: "Bus", route: "Dumka → Rampurhat", via: "nearest railhead, via Shikaripara", depart: "Every ~1 hr, 06:00 AM–05:00 PM", duration: "~1.5 hr" },
  { mode: "Train", route: "Rampurhat Jn (nearest station)", via: "connects to Howrah / Malda / NJP lines", depart: "Check NTES / 139 for live status", duration: "Dumka town is ~27 km from Rampurhat" },
  { mode: "Train", route: "Jasidih Jn (via Deoghar)", via: "connects to Howrah / Patna / Delhi lines", depart: "Check NTES / 139 for live status", duration: "Dumka town is ~55 km from Jasidih" },
];

const ESSENTIALS_DATA = [
  { category: "Printing & Xerox", name: "Shop near SKMU main gate", locality: "Sido Kanhu Murmu University road", hours: "9 AM – 8 PM", note: "Spiral binding, project printing" },
  { category: "Printing & Xerox", name: "Shop near Dumka Engineering College", locality: "College road", hours: "9 AM – 9 PM", note: "Also sells graph sheets" },
  { category: "Stationery", name: "General stationery store", locality: "Shivpahari market", hours: "8 AM – 8:30 PM", note: "Lab coats, drawing sheets, registers" },
  { category: "Pharmacy", name: "24-hour medicine counter", locality: "Near Sadar Hospital, Dumka", hours: "Open 24 hrs", note: "Keep this one saved for emergencies" },
  { category: "Pharmacy", name: "Local chemist", locality: "Hiranpur road", hours: "8 AM – 10 PM", note: "" },
  { category: "Budget food", name: "Student thali mess", locality: "Near SKMU hostel gate", hours: "Lunch 12–3 PM, Dinner 7–10 PM", note: "~₹50 thali" },
  { category: "Budget food", name: "Tea & snacks stall", locality: "College crossing", hours: "7 AM – 10 PM", note: "Good for a quick break between classes" },
  { category: "Recharge / Xerox / SIM", name: "Mobile recharge & SIM counter", locality: "Shivpahari market", hours: "9 AM – 8 PM", note: "" },
];

const EMERGENCY_CONTACTS = [
  { name: "National Emergency (Police / Fire / Medical)", number: "112", note: "All-in-one emergency number, works pan-India" },
  { name: "Ambulance", number: "108", note: "Free ambulance service" },
  { name: "Police Control Room", number: "100", note: "" },
  { name: "Fire Services", number: "101", note: "" },
  { name: "Women's Helpline", number: "1091", note: "" },
  { name: "Sadar Hospital, Dumka", number: "Ask hostel warden for current number", note: "Save the real number here once confirmed" },
  { name: "College / Hostel Warden", number: "Add your warden's number", note: "Tap Edit in Contacts to fill this in for your hostel" },
];

const MESS_MENU_DEFAULT = [
  { day: "Monday", breakfast: "Poha, tea", lunch: "Rice, dal, aloo-sabzi", dinner: "Roti, mixed veg, dal" },
  { day: "Tuesday", breakfast: "Bread-omelette/sprouts, tea", lunch: "Rice, dal, egg curry", dinner: "Roti, paneer/soya, dal" },
  { day: "Wednesday", breakfast: "Upma, tea", lunch: "Rice, dal, seasonal sabzi", dinner: "Khichdi, papad" },
  { day: "Thursday", breakfast: "Paratha, curd", lunch: "Rice, dal, chicken/egg (non-veg day)", dinner: "Roti, veg curry" },
  { day: "Friday", breakfast: "Idli/sprouts, tea", lunch: "Rice, dal, aloo-gobi", dinner: "Roti, dal, salad" },
  { day: "Saturday", breakfast: "Puri-sabzi, tea", lunch: "Rice, dal, fish/paneer", dinner: "Roti, mixed veg" },
  { day: "Sunday", breakfast: "Chola-bhatura/semolina, tea", lunch: "Special thali", dinner: "Light khichdi" },
];

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["8–9", "9–10", "10–11", "11–12", "12–1", "1–2", "2–3", "3–4", "4–5"];
