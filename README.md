# Vowable

A wedding planning web app for South Africa (Western Cape focus), built with React + Vite.

## Features

- **Onboarding**: Set wedding date, guest count, budget, location, theme, and priorities
- **Explore**: Browse venues, caterers, florists, boutiques, and accommodations from Western Cape
- **Saved Items**: Save listings to shortlist with notes, estimated costs, and status tracking
- **Budget**: Track total budget, committed spend, and remaining budget with suggested allocations
- **Checklist**: Auto-generated tasks with due dates based on wedding date and priorities

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
vowable/
├── src/
│   ├── components/       # Reusable UI components
│   ├── domain/          # Business logic and types
│   ├── layouts/         # Layout components
│   ├── pages/           # Page components
│   ├── routes/          # Routing configuration
│   ├── services/        # Service stubs (Pinterest, Maps, etc.)
│   ├── state/           # State management (Zustand)
│   ├── styles/          # Theme and global styles
│   └── data/            # Seed data (listings)
```

## Data Persistence

The app uses Supabase (Auth + Postgres) for data persistence:
- `weddingPlan`: Wedding plan data
- `savedItems`: Saved listings
- `checklistItems`: Checklist tasks with completion status

## Future Integrations

Service stubs are in place for:
- Pinterest API (OAuth + inspiration search)
- Maps integration (Google Maps / Mapbox)
- Accommodation API (LekkerSlaap)

These can be implemented as isolated service modules without affecting the core app.

## License

MIT
