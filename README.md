# 📡 NetworkWise

NetworkWise is a modern, developer-first, location-based mobile network recommender system. It aggregates cellular telemetry logs, coverage datasets, and crowdsourced latency audits to dynamically score and rank local telecom providers (MTN, Airtel, Glo, 9mobile) based on exact GPS coordinates.

Built with a high-contrast dark-mode design, clean borderless dashboards, and an orange branding theme, it features an interactive geographical map and responsive controls to find the best carrier right where you stand—without having to run heavy, data-consuming bandwidth speed tests.

---

## 🚀 Key Features

*   **Weighted Scoring Engine**: Automatically ranks cellular networks using a modular benchmarking algorithm:
    *   **50% Download Speed**: Normalized against a standard 100 Mbps broadband speed.
    *   **25% Signal Coverage**: Evaluates regional signal strength capacity (0-100%).
    *   **15% Latency**: Prioritizes fast connection responsiveness (RTT under 10ms scores 100%).
    *   **10% Connection Reliability**: Calculates packet success rate and stability metrics.
*   **Geospatial Geocoding**: Translates raw GPS latitude and longitude into readable location addresses (e.g., "Osiele, Ogun State") using OpenStreetMap Nominatim with local bounding boxes as fallbacks.
*   **Interactive Maps**: Sleek Map component utilizing Leaflet and CartoDB Voyager tiles overlays to visualize user coordinate pins.
*   **Mobile First Responsive Layout**: Collapsible hamburger navbar menu drawer with slide transitions and card modules that dynamically resize on mobile screens.
*   **Docker Container Orchestration**: Pre-configured Postgres DB sync, schema push, database seeding, and production multi-stage compiles.

---

## 🛠️ Tech Stack

### Frontend
*   **Next.js 16 (App Router + Turbopack)**: Server-side rendering and client-side page transitions.
*   **Tailwind CSS (v4)**: Modern, custom utility tokens and layout systems.
*   **Framer Motion**: Smooth micro-animations, radar scanners, drawer togglers.
*   **React Query**: Clean cache synchronization for regional API request logs.
*   **Leaflet**: Dynamic map container widgets.

### Backend
*   **Node.js & Express**: High-performance REST API services.
*   **TypeScript**: Type-safety checks across controllers and services.
*   **Prisma ORM**: Modern database models and schema sync.
*   **PostgreSQL**: Secure storage of metrics log clusters.

---

## 📦 Project Structure

```text
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma models (Provider, LocationMetric)
│   │   └── seed.js            # Regional cellular metrics seeding
│   ├── src/
│   │   ├── adapters/          # Ingestion adapters (Database, Mock Feeds)
│   │   ├── controllers/       # REST query routing controllers
│   │   ├── services/          # Algorithm scoring & geocoding services
│   │   └── index.ts           # Server runner
│   └── Dockerfile             # Multi-stage Debian-slim container build
├── frontend/
│   ├── src/
│   │   ├── app/               # Landing page, layout pages, CSS rules
│   │   ├── components/        # Radar animation, maps, leaderboard elements
│   │   └── utils/             # Fetch wrappers and geocoding services
│   └── Dockerfile             # Multi-stage Next.js Turbopack build
├── docker-compose.yml         # Container orchestration config
└── .gitignore                 # Secure files filter list
```

---

## ⚙️ Launching Instructions

### 🐋 Method A: Running with Docker (Recommended)

Ensure you have Docker and Docker Desktop running. Clone this repository, navigate to the root directory, and execute:

```bash
# 1. Spin up the Postgres database, API backend, and frontend containers
docker compose up -d --build --force-recreate

# 2. Check running services
docker ps
```
The Docker container automatically runs the Postgres engine, pushes the Prisma database schema, seeds local regional benchmarks, and exposes the ports:
*   **Frontend UI**: [http://localhost:3000](http://localhost:3000)
*   **Backend API**: [http://localhost:5000](http://localhost:5000)
*   **Database Studio**: [http://localhost:5555](http://localhost:5555) (Open a separate terminal and run `npx prisma studio` inside `backend/` to view DB tables).

### 💻 Method B: Local Development Setup

If you prefer to run the system without Docker, set up your PostgreSQL server and follow these steps:

#### 1. Setup Backend
```bash
cd backend

# Copy template variables and update your DATABASE_URL connection string
cp .env.example .env

# Install dependencies (recompiles native packages for your OS)
npm install

# Push schema and seed regional metrics
npx prisma db push
npm run prisma:seed

# Start development server
npm run dev
```

#### 2. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start development client
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

### Get Recommendations
Returns ranked mobile network recommendations for specific geographic coordinates.

*   **URL**: `/recommend`
*   **Method**: `GET`
*   **Params**:
    *   `latitude` (number, required): GPS Latitude.
    *   `longitude` (number, required): GPS Longitude.
*   **Success Response (200 OK)**:
    ```json
    {
      "location": "Osiele, Ogun State",
      "recommended": "MTN",
      "providers": [
        {
          "name": "MTN",
          "score": 88,
          "speed": 62.4,
          "latency": 18,
          "coverage": 95,
          "reliability": 97
        },
        {
          "name": "Airtel",
          "score": 82,
          "speed": 55.2,
          "latency": 22,
          "coverage": 92,
          "reliability": 94
        }
      ]
    }
    ```

---

## 🤝 Contributing & Forking

Contributions, bug reports, and features suggestions are welcome!

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally:
    ```bash
    git clone https://github.com/your-username/network-rec.git
    cd network-rec
    ```
3.  Create a **feature branch**:
    ```bash
    git checkout -b feature/cool-new-algorithm
    ```
4.  Commit your changes following standard guidelines.
5.  Push to your fork and submit a **Pull Request**.

---

## 📄 License
This project is open-source and available under the MIT License.
