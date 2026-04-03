# Aalto Exchange Dashboard

A modern frontend for Aalto University's MoveON exchange database. 

This project replaces the legacy UI with a high-performance discovery dashboard, helping Aalto students find their exchange destinations quickly and easily.

## Motivation

Navigating the official Aalto University exchange database can be a slow and frustrating process. I built this dashboard to provide a lightning-fast, modern alternative that drastically reduces the friction of finding the perfect exchange destination. 

Beyond just a UI facelift, I wanted to enrich the decision-making process by integrating critical data that the official portal lacks. By adding global prestige indicators (QS World University Rankings) and historical application statistics (academic index thresholds and applicant volumes), students can accurately gauge their chances of acceptance and make data-driven choices. Finally, to combat choice paralysis among hundreds of global destinations, I added a gamified "I'm Feeling Lucky" feature to help students discover hidden gems they might have otherwise overlooked.

## Features

* Fast Search: Client-side fuzzy matching across universities, countries, and cities.
* Interactive Map: A responsive map to explore global destinations visually.
* Clean Data: Automatically extracts and formats academic terms and requirements from the legacy MoveON API.
* Shareable Links: URL deep linking allows you to share specific university profiles directly.
* Reliable: Built-in static JSON fallback ensures the dashboard stays live even if the official servers go down.
* Mobile-Responsive: Designed to work seamlessly on both desktop and mobile devices.

## Technologies

* Framework: Next.js 15 (App Router)
* Language: TypeScript
* Styling: Tailwind CSS
* Maps: Leaflet.js (via react-leaflet)
* Search: Fuse.js
* Analytics: Vercel Analytics

## How to Run

### Prerequisites

* Node.js (v18 or higher)
* npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aalto-exchange.git
   cd aalto-exchange
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application:
   Navigate to http://localhost:3000 in your web browser.
