# CONTEXT.md: Aalto Exchange

## 1. Project Vision
A "Shadow Frontend" for Aalto University’s MoveON exchange database. This tool replaces the legacy, slow UI with a high-performance, SaaS-style discovery dashboard. It prioritizes "speed-to-insight" through instant client-side filtering, interactive geospatial visualization, and parsed, easy-to-read academic requirements alongside modern prestige signals (QS 2026 Rankings).

---

## 2. Technical Stack
* **Framework:** Next.js 15 (App Router) + TypeScript.
* **Styling:** Tailwind CSS + Lucide React (Icons).
* **State Management:** Client-side heavy. The main dataset (~1MB) is fetched once via a proxy, cached, and stored in React Context/State (`UniversityContext`) for zero-latency interactions.
* **Search Engine:** `Fuse.js` for instant client-side fuzzy matching.
* **Geospatial:** `Leaflet.js` (React-Leaflet) with `MarkerCluster`. 
    * **Constraint:** Must use Next.js dynamic imports (`next/dynamic`) with `ssr: false` for all Leaflet components (Main Map and MiniMap) to avoid window-hydration errors.

---

## 3. Architecture & Data Flow

To bypass CORS restrictions and obscure legacy API complexities, all communication with the MoveON backend happens server-side via Next.js API routes.

### A. Next.js API Proxies
1. **`/api/fetch-data` (POST)**: 
   - Fetches the master list of universities.
   - Endpoint: `https://aalto.adv-pub.moveon4.de/ap-dashboard/admin-ajax.php`
   - Payload: `action: "load_report_data_on_ajax_load"`, `searched_data[publisher_id]: "11"`
2. **`/api/fetch-uni-details` (POST)**:
   - Fetches rich details for a specific university (HTML descriptions, terms, PDF metadata).
   - Payload: Requires `core_id` and `relation_id`.
3. **`/api/fetch-pdf` (GET)**:
   - Streams PDF blobs (Travel Reports and Fact Sheets) directly to the client.
   - Designed to be used as a standard `href` link (`<a target="_blank">`) so PDFs open natively in a new tab rather than forcing local downloads.

### B. Transformation, Enrichment & MoveON API Quirks
* **Irregular JSON Serialization:** If an item in the MoveON database is deleted, sequential arrays are sometimes returned as JSON Objects with string keys (e.g., `{"0": {...}, "2": {...}}`). API routes check `Array.isArray()` and fallback to `Object.values()` when parsing fields like `relations`, `institutions`, and `travelreports`.
* **HTML Parsing:** Critical academic data (GPA requirements, language certificates, ECTS credits) is embedded within raw HTML strings (like `in_brief`). The server/processor utilizes Regex to extract and structure this data cleanly before sending it to the frontend.
* **QS 2026 Integration:** Match `labelvalue[i].name` with `src/data/rankings2026.json`. Default `qsRank` to `999` if no match is found.

---

## 4. UI/UX "Vibe" & Features
* **Theme:** Clean light mode.
* **Layout Structure:** Fixed-height "App View" (no full-page scrolling) divided into a Master-Detail architecture:
    * **Left Sidebar:** Scrollable accordion list of university cards, grouped by country. Displays instant Fuse.js search results.
    * **Main Panel (Empty State):** Full-screen interactive map showing all available destinations.
    * **Main Panel (Selected State):** Replaces the big map with a rich profile detailing parsed academic terms, language requirements, a static MiniMap, and one-click access to Travel Reports in new tabs.
* **Interactivity:**
    *   **Bi-directional Sync:** Clicking a map marker opens the sidebar accordion and selects the card; clicking a sidebar card pans the main map or opens the detail view.