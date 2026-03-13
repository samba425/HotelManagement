# Hotel Management Analytics — Enterprise POC

Angular 19 analytics dashboard for US luxury hotel properties. Features real-time KPIs, interactive ECharts visualizations, AI chatbot, and dark mode — powered entirely by mock data.

## Quick Start

### Docker (recommended)

```bash
docker compose up --build
```

Open **http://localhost:4200**

### Local Development

```bash
npm ci
ng serve
```

Open **http://localhost:4200**

## Features

- **Dashboard** — Revenue, Occupancy, RevPAR, GOPPAR KPIs with animated counters
- **Branch Analytics** — Per-property deep dive (6 US flagship hotels)
- **Sales Insights** — Menu performance, peak hours heatmap, category breakdown
- **Supply Chain** — Ingredient cost treemap, procurement forecast
- **Labor Management** — Staffing by department, labor cost trends
- **Predictions** — 30-day demand forecast with confidence bands, holiday prep
- **AI Chatbot** — Context-aware assistant with suggestion chips

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 19 (standalone components, signals) |
| UI | Angular Material 19, Tailwind CSS 3 |
| Charts | Apache ECharts via ngx-echarts |
| Icons | Lucide Angular |
| Mock API | HTTP interceptor + local JSON |
| Container | Docker multi-stage (Node 20 build → Nginx 1.27) |

## Project Structure

```
src/
├── app/
│   ├── core/          # Models, services, state, interceptors
│   ├── features/      # Dashboard, branches, sales, supply-chain, labor, predictions, chatbot
│   └── shared/        # KPI card, chart card, data table, pipes, directives
├── assets/mock-data/  # 11 US-localized JSON files
├── environments/      # Dev (mock) / Prod config
└── styles/            # Tailwind tokens, Material theme, CSS variables
```
