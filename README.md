# Restaurant Analytics Platform

Enterprise-grade analytics dashboard for a US restaurant chain. Features real-time KPIs with animated counters, interactive ECharts visualizations, AI chatbot with chart/table responses, glassmorphism UI, dark mode, and full Docker deployment -- powered entirely by mock data.

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

## US Restaurant Locations (Mock Data)

| Location | City | Seats | Rating |
|----------|------|-------|--------|
| The Grand Manhattan | New York, NY | 280 | 5-star |
| Coastal Luxe Miami | Miami Beach, FL | 240 | 5-star |
| Beverly Hills Royale | Beverly Hills, CA | 200 | 5-star |
| Lakeshore Tower Chicago | Chicago, IL | 260 | 4-star |
| Pacific Heights SF | San Francisco, CA | 180 | 4-star |
| The Oasis Las Vegas | Las Vegas, NV | 320 | 5-star |

Total portfolio: **1,480 seats** across 6 flagship locations.

## Features

### Dashboard
- Revenue, Occupancy Rate, RevPAR, GOPPAR KPI cards with animated number counters and sparkline trends
- Revenue trend chart (12-month line)
- Occupancy vs ADR comparison (dual-axis)
- Revenue by branch (bar chart)
- Department cost breakdown (pie chart)

### Branch Analytics
- Per-location deep dive with all KPIs scoped to selected branch
- Branch-specific revenue, occupancy, and operational metrics
- Switch between restaurants via the top-bar branch selector

### Sales Insights
- Menu item performance and daily sales trends
- Peak hours heatmap (hour x day-of-week)
- Category breakdown (cuisine type revenue split)

### Supply Chain
- Ingredient cost treemap visualization
- Procurement forecast by item
- Par level vs projected need analysis

### Labor Management
- Staffing by department (Kitchen, Front Desk, Housekeeping, F&B, Valet)
- Labor cost trends over time
- Morning vs evening shift distribution

### Predictions
- 30-day demand forecast with confidence bands
- Holiday preparation planning (Thanksgiving, Christmas, NYE)
- Weekend surge prediction (+25% typical uplift)

### AI Chatbot
- Floating action button (bottom-right) opens the chat panel
- Keyword-matched responses with charts, tables, and text
- Context-aware suggestion chips that update based on conversation
- Typing indicator animation
- Copy message support

## AI Chatbot -- Supported Queries

The chatbot responds to natural-language questions matched by keywords. Below are all supported query categories with example phrases you can ask.

### Greetings
| Example phrases | Response |
|-----------------|----------|
| "Hi", "Hello", "Hey", "Good morning", "Good evening" | Welcome message with suggestion chips for top topics |

### Top Dishes / Menu Performance
| Example phrases | Response |
|-----------------|----------|
| "What are the top dishes?", "Best selling menu items", "Popular dishes" | Bar chart of top 5 dishes with avg daily units (NY Strip Steak: 42/day, Grilled Salmon: 35/day, Wagyu Burger: 28/day) |
| "Miami seafood", "Coastal dishes", "Ocean menu" | Miami-specific top dishes (Grilled Salmon: 38/day, Lobster Tail: 22/day) |

### Ingredient & Procurement
| Example phrases | Response |
|-----------------|----------|
| "Ingredient needs", "Procurement forecast", "What to order", "Supply inventory" | Table with current par, projected need, and reorder quantity for Ribeye, Salmon, Lobster |

### Staffing & Labor
| Example phrases | Response |
|-----------------|----------|
| "Staff schedule", "Shift coverage", "Labor needs" | Chart of staff count by department (Kitchen, Front Desk, Housekeeping, F&B, Valet) split by morning/evening shift |
| "Weekend staffing", "Saturday coverage", "Busy days" | Weekday vs Weekend staffing comparison with +8 Kitchen, +6 F&B, +4 Housekeeping recommendation |

### Utility Costs
| Example phrases | Response |
|-----------------|----------|
| "Utility costs", "Electricity breakdown", "Gas and water" | Pie chart -- Electricity $14,200, Gas $9,800, Water $2,100 |
| "Utility by branch", "Compare utilities by restaurant" | Bar chart of monthly utility cost per branch (Vegas/Miami highest due to AC) |

### Branch Revenue
| Example phrases | Response |
|-----------------|----------|
| "Branch revenue", "Revenue by location", "Restaurant performance" | Bar chart -- Manhattan $2.1M, Vegas $1.9M, Chicago $1.8M, Miami $1.65M, Beverly Hills $1.42M, SF $1.18M |

### Revenue Comparison
| Example phrases | Response |
|-----------------|----------|
| "Compare revenue", "Revenue comparison", "Revenue vs" | Multi-branch revenue breakdown with bar chart (last 30 days) |

### Occupancy
| Example phrases | Response |
|-----------------|----------|
| "What is the occupancy rate?", "Rooms filled", "Occupancy" | Gauge chart showing 87% current occupancy, up 4% from last week |
| "Occupancy trend", "Trending occupancy" | Line chart of 4-week occupancy trend (78% -> 82% -> 85% -> 87%), projected 92% this weekend |

### Food Cost Analysis
| Example phrases | Response |
|-----------------|----------|
| "Food cost", "COGS", "Cost of goods", "Food cost percent" | Bar chart by cuisine -- Steakhouse 38%, Seafood 35%, Italian 29%, American 31%, Asian 28% (target 28-32%) |

### Labor Cost
| Example phrases | Response |
|-----------------|----------|
| "Labor cost", "Labor expense", "Payroll breakdown" | Pie chart -- Kitchen 42%, F&B Service 28%, Housekeeping 18%, Front Desk 8%, Valet 4% (Total: $186K/month) |

### Peak Hours
| Example phrases | Response |
|-----------------|----------|
| "Peak hours", "Busiest times", "Rush hours", "Heatmap" | Heatmap of covers by hour and day-of-week. Saturday dinner (7 PM) is the busiest slot at 120 covers |

### Demand Forecast
| Example phrases | Response |
|-----------------|----------|
| "Forecast", "Demand prediction", "Predict next week" | Line chart of 7-day forecast for NY Strip and Salmon with weekend surge |
| "Thanksgiving demand", "Christmas forecast", "Holiday demand" | Bar chart -- Thanksgiving 1,350 covers, Christmas 1,400, NYE 1,500. Prep 40% extra protein |

### Holiday Preparation
| Example phrases | Response |
|-----------------|----------|
| "Holiday prep", "Memorial Day", "Prepare for event" | Comprehensive prep plan -- 96% predicted occupancy, +30% protein par, +12 staff, $8.5K utility budget |

### General Help
| Example phrases | Response |
|-----------------|----------|
| "Help", "What can you do?", "Options" | Full list of capabilities with suggestion chips |

### Suggestion Chips (Quick Actions)

The chatbot displays clickable suggestion chips that update contextually:

- **Default**: "Top dishes this week?", "Revenue across all locations", "Staff needed for NYE?"
- **After dish query**: "Ingredient costs for top dishes", "Revenue by cuisine type", "Peak dining hours"
- **After revenue query**: "Compare branch profitability", "RevPAR trend this month", "GOPPAR analysis"
- **After staffing query**: "Labor cost as % of revenue", "Overtime analysis", "Department staffing levels"
- **Fallback**: "Holiday preparation plan", "Occupancy forecast", "Top selling dishes", "Utility cost breakdown"

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Angular (standalone components, signals) | 21 |
| UI Components | Angular Material | 21 |
| Styling | Tailwind CSS | 3.4 |
| Charts | Apache ECharts via ngx-echarts | 5.6 / 21 |
| Icons | Lucide Angular | 0.577 |
| Mock API | HTTP interceptor + local JSON | -- |
| Container | Docker multi-stage (Node 20 build, Nginx 1.27 serve) | -- |
| Language | TypeScript | 5.9 |

## Mock Data Files

11 JSON files in `src/assets/mock-data/` power the entire application:

| File | Description |
|------|-------------|
| `branches.json` | 6 US restaurant locations with address, seats, rating |
| `financial-operations.json` | Revenue, expenses, GOPPAR, RevPAR by branch/month |
| `daily-sales.json` | Daily transaction-level sales data |
| `menu-items.json` | Restaurant menu items with pricing and categories |
| `restaurants.json` | Restaurant outlets within each location |
| `ingredients.json` | Ingredient inventory, par levels, costs |
| `recipes.json` | Dish recipes with ingredient quantities |
| `labor.json` | Staff records by department, shift, branch |
| `utilities.json` | Electricity, gas, water usage and cost data |
| `predictions.json` | 30-day demand forecasts with confidence intervals |
| `chat-responses.json` | 20 chatbot response templates with charts/tables |

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/   # Mock API interceptor (routes /api/v1/* to JSON files)
│   │   ├── models/         # TypeScript interfaces (8 model files)
│   │   ├── services/       # Data services + KPI engine + chatbot (9 services)
│   │   └── state/          # Signal-based state (branch, date-range, theme)
│   ├── features/
│   │   ├── branch-analytics/   # Per-location deep dive
│   │   ├── chatbot/            # AI chat panel (5 components)
│   │   ├── dashboard/          # Main KPI dashboard
│   │   ├── labor/              # Staffing overview
│   │   ├── predictions/        # Demand forecasting
│   │   ├── sales-insights/     # Sales trends
│   │   └── supply-chain/       # Ingredient tracker
│   └── shared/
│       ├── components/     # KPI card, chart card, data table, branch selector, etc.
│       ├── directives/     # Animate-on-scroll
│       └── pipes/          # Currency short, percentage
├── assets/mock-data/       # 11 US-localized JSON files
├── environments/           # Dev (mock API) / Prod config
└── styles/                 # Tailwind tokens, Material theme, CSS variables
```

## UI Design

- **Glassmorphism** cards with frosted glass effect and subtle borders
- **Animated number counters** on KPI cards using requestAnimationFrame
- **Sparkline mini-charts** embedded in each KPI card
- **Animated gradient mesh** background across main content area
- **Dark mode** toggle with smooth CSS transitions and localStorage persistence
- **Collapsible sidebar** with animated transitions
- **Skeleton loading** states while data loads
- **Page route transitions** using Angular View Transitions API

## Docker Details

Multi-stage build producing a ~60 MB production image:

- **Stage 1 (build)**: `node:20-alpine` -- installs deps with `npm ci`, builds with `ng build --configuration=production`
- **Stage 2 (serve)**: `nginx:1.27-alpine` -- serves static files with gzip, security headers, SPA fallback routing
- Non-root user (`appuser:1001`)
- Health check endpoint at `/health`
- Exposed on port `4200` (mapped to container port `80`)

```bash
# Build and start
docker compose up --build

# Stop
docker compose down

# Rebuild after code changes
docker compose up --build --force-recreate
```

## Environment Configuration

| Variable | Dev | Prod |
|----------|-----|------|
| `useMockApi` | `true` | `false` |
| `apiBaseUrl` | `/api/v1` | `/api/v1` |
