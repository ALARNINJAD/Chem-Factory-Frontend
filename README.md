# Chem-Factory-Frontend

A retro pixel-art web frontend for the Chem-Factory chemical factory simulation game. Explore the factory floor, buy raw materials, combine them in mixing machines, and trade with other players on the market.

## Demo
https://github.com/user-attachments/assets/14794dbc-dcfc-4ceb-9493-17afb1ef6464

## Features

- **User Authentication** - Login and registration with JWT-based sessions
- **Factory Floor** - Interactive dashboard with machines and stations
- **Material Mixing** - Pick two ingredients, set quantity, and start a mix with live countdown timers
- **Material Discovery** - Mix unknown combinations to discover and name new materials
- **Inventory Management** - View and manage your material stock at the storage station
- **Marketplace** - Buy from and sell to other players directly on the floor
- **Player Profiles** - Track balance, XP, level, listings, and active mixes
- **Pixel Art Style** - Retro CRT aesthetic with custom sprites, chiptune-style sound effects, and GSAP animations

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Animations | GSAP (@gsap/react) |
| Backend API | Chem-Factory (Go/Gin) REST API |

## Project Structure

```
chem-factory-frontend/
├── src/
│   ├── app/                    # App Router pages & layout
│   │   ├── layout.tsx          # Root layout (providers, pixel font, HUD)
│   │   ├── page.tsx            # Title screen
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── dashboard/          # Factory floor (game hub)
│   │   ├── inventory/          # Inventory page
│   │   ├── market/             # Marketplace page
│   │   ├── mixer/              # Mixer page
│   │   └── profile/            # Player profile page
│   ├── components/
│   │   ├── factory/            # Factory station components
│   │   │   ├── station-shop.tsx    # Shop (buy raw materials)
│   │   │   ├── station-storage.tsx # Storage (your stock)
│   │   │   ├── station-market.tsx  # Market (trade with players)
│   │   │   ├── station-mixer.tsx   # Mixer (combine materials)
│   │   │   ├── machine-card.tsx    # Mixing machine display
│   │   │   ├── discovery-modal.tsx # New material discovery flow
│   │   │   ├── qty-stepper.tsx     # Quantity stepper control
│   │   │   └── game-modal.tsx      # Shared modal
│   │   ├── game-hud.tsx        # Persistent HUD (logo, balance, menu)
│   │   ├── material-icon.tsx   # Material sprite icons
│   │   └── toast.tsx           # Toast notifications
│   └── lib/
│       ├── api.ts              # Backend API client
│       ├── auth-context.tsx    # Auth state (JWT)
│       ├── game-context.tsx    # Game state (profile/inventory/market/mixes)
│       ├── icons.ts            # Material icon overrides
│       ├── sfx.ts              # Sound effects
│       ├── types.ts            # TypeScript types
│       └── use-is-client.ts    # Client-only hook
├── public/
│   ├── items/                  # Material sprite assets
│   └── logo.png, logo-sm.png   # Branding images
├── next.config.ts              # API rewrite proxy
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (or yarn/pnpm/bun)
- A running instance of the [Chem-Factory](https://github.com/ALARNINJAD/Chem-Factory) backend API

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Chem-Factory-Frontend

# Install dependencies
npm install
```

### Configuration

No env vars are required. The frontend proxies `/api/*` requests to the backend via `next.config.ts` rewrites (pointing at `http://localhost:8090` by default) — API calls stay relative and avoid CORS issues. Edit the rewrite destination in `next.config.ts` if your backend runs elsewhere.

### Running the Application

**Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Make sure the backend is running** on `http://localhost:8090`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Title screen with start button |
| `/login` | User login |
| `/register` | User registration |
| `/dashboard` | Factory floor - the main game hub with mixing machines and stations |
| `/inventory` | Material inventory |
| `/market` | Marketplace |
| `/mixer` | Mixer management |
| `/profile` | Player profile & stats |

## Development

### Running with Hot Reload
```bash
npm run dev
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

## Backend
**[Chem-Factory-Backend](https://github.com/ALARNINJAD/Chem-Factory)** - Developed by [Ali Rahiminejad](https://github.com/ALARNINJAD)

## License

MIT License - feel free to use and modify for your own projects.
