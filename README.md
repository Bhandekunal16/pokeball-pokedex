# PokéSphere Explorer

A modern, responsive, full-featured Pokémon Explorer and Pokédex web application built with **React**, **Vite**, and **Tailwind CSS**.

## Features

- **National Pokédex Collection**: Browse over 1,300+ Pokémon records directly fetched from the real Pokémon API server.
- **Official Artwork**: High-resolution official Pokémon artwork with support for shiny variant artwork toggles and sprite fallbacks.
- **Global Search & Filter**: Instant debounced search supporting Pokémon names (e.g. `Lucario`) and numeric IDs (e.g. `448` or `25`), keyboard shortcut (`/`), type-based filtering, and sorting by ID or name.
- **In-Depth Pokémon Detail Pages**: Comprehensive battle stats with animated progress bars, official audio cries, height/weight metrics, abilities with hidden ability badges, and full moves catalogue.
- **Dedicated Resource Sections**:
  - **Moves**: Power, accuracy, PP, damage class (physical, special, status), elemental types, and battle descriptions.
  - **Abilities**: Passive traits, generation origin, detailed effects, and Pokémon lists.
  - **Types**: Interactive weakness/resistance matrix (double damage to/from, half damage, immunities).
  - **Items**: Item sprites, categories, fling powers, shop costs, and descriptions.
  - **Locations & Regions**: Explore geographical regions (Kanto, Johto, Hoenn, etc.) and discoverable encounter locations.
  - **Universal 24-Resource Explorer**: Full access to all 24 PokeAPI endpoints (evolution chains, egg groups, natures, growth rates, habitats, characteristics) with live JSON inspector.
- **Favorites & Squad Builder**: Persistent squad stored locally in `LocalStorage` with one-click toggling and dedicated squad manager.
- **Light & Dark Theme**: Pokédex-inspired dark navy UI with vibrant elemental glow accents and clean light mode toggle.
- **Configurable API Endpoint**: Seamlessly toggle between Production API (`https://free-api-server.vercel.app/pokemon`) and Local Development API (`http://localhost:3000/pokemon`) via the built-in Settings dialog with live ping latency test.

## Tech Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router 7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Persistence**: Browser LocalStorage

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 3. Build for Production

```bash
npm run build
```
