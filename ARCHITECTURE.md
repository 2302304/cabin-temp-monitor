# 🏗️ Arkkitehtuuridokumentaatio

## Yleiskuva

Kesämökin lämpötilaseurantajärjestelmä on kolmitasoinen (3-tier) full stack -sovellus, joka koostuu:
- **Frontend**: React SPA (Single Page Application)
- **Backend**: Node.js REST API
- **Database**: PostgreSQL aikasarja-tietokanta

## Arkkitehtuuriperiaatteet

### 1. IoT-valmius alusta alkaen
- **Abstraktio**: Device-malli tukee sekä simuloitua (SEED) että oikeaa (IOT) dataa
- **API-first**: Kaikki toiminnot saatavilla RESTful API:n kautta
- **Laajennettavuus**: Uusien laitteiden lisäys ei vaadi muutoksia frontend-koodiin

### 2. Skaalautuvuus
- **Indeksoitu data**: Optimoidut kyselyt deviceId + timestamp perusteella
- **Aggregointi**: Data aggregoidaan tarkoituksenmukaiseen määrään pisteitä
- **Välimuisti**: Mahdollisuus lisätä Redis jatkossa

### 3. Turvallisuus
- **Input validointi**: Kaikki API-endpointit validoivat inputin
- **SQL-injektio suojaus**: Prisma ORM prepared statements
- **CORS**: Rajattu vain sallittuihin origineihin
- **Helmet.js**: HTTP security headers

### 4. Ylläpidettävyys
- **TypeScript**: Tyyppiturvallisuus sekä frontend että backend
- **Modulaarinen rakenne**: Selkeä vastuunjako (services, controllers, routes)
- **Error handling**: Keskitetty virheenkäsittely
- **Logging**: Strukturoitu lokitus

## Backend Arkkitehtuuri

### Layer-arkkitehtuuri

```
┌─────────────────────────────────────┐
│        HTTP Layer (Express)          │
│  - CORS, Helmet, Compression        │
│  - Body parsing, Error handling     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Routes Layer                 │
│  - Endpoint määrittelyt             │
│  - Request routing                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Controller Layer               │
│  - Request/Response handling        │
│  - Input validation                 │
│  - Response formatting              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        Service Layer                 │
│  - Business logic                   │
│  - Data aggregation                 │
│  - Alert checking                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Data Access Layer (Prisma)      │
│  - Database queries                 │
│  - Type safety                      │
│  - Migrations                       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          PostgreSQL                  │
│  - Data persistence                 │
│  - ACID transactions                │
└─────────────────────────────────────┘
```

### Tietokannan optimoinnit

#### Indeksit
```sql
-- Reading-taulussa
INDEX ON (deviceId, timestamp DESC)  -- Laitteen historia
INDEX ON (timestamp)                  -- Aikaperusteinen haku

-- Alert-taulussa
INDEX ON (deviceId, isResolved)       -- Aktiiviset hälytykset per laite
INDEX ON (createdAt DESC)             -- Uusimmat hälytykset
```

#### Data aggregointi
- **hour**: 1 min välein → max 60 pistettä
- **day**: 15 min välein → max 96 pistettä
- **week**: 1h välein → max 168 pistettä
- **month**: 6h välein → max 120 pistettä
- **year**: 1 päivä välein → max 365 pistettä

## Frontend Arkkitehtuuri

### Component Hierarchy

```
App
├── Header
├── AlertSection
│   └── AlertBadge[]
└── DeviceGrid
    ├── DeviceCard[]
    └── DeviceDetail (Modal)
        ├── StatisticsCards
        ├── TimeRangeSelector
        ├── TemperatureChart
        └── AlertList
```

### Data Flow

```
Component → API Service → Backend API → Database
    ↓           ↓              ↓            ↓
  State      HTTP Request   Controller   Query
    ↓           ↓              ↓            ↓
Re-render   Response       Service       Data
```

### State Management
- **Local State**: useState hooks komponenteissa
- **Auto-refresh**: 30s interval kaikelle datalle
- **Modal State**: Yksinkertainen show/hide DeviceDetail

## Data-simulaatio

### TemperatureSimulator

```typescript
generateTemp(date: Date) {
  // 1. Peruslämpötila sijainnin mukaan
  baseTemp = getBaseTemp(location)
  
  // 2. Vuorokausivaihtelut (sini-aalto)
  dailyVariation = sin((hour - 6) * π / 12) * amplitude
  
  // 3. Satunnainen kohina
  noise = (random() - 0.5) * variation
  
  // 4. Laadun arviointi
  quality = checkQuality(temp, failures)
  
  return { temp, quality }
}
```

### Realistisuus
- **Sisätilat**: ±1.5°C vuorokausivaihtelut
- **Ulkotilat**: ±8°C vuorokausivaihtelut
- **Katkokset**: 1% todennäköisyys (quality: ERROR)
- **Poikkeamat**: 2% todennäköisyys (quality: WARNING)

## Hälytysjärjestelmä

### Alert Flow

```
New Reading
    ↓
Temperature Check
    ↓
Outside threshold? ──No──> Check if alert exists ──Yes──> Resolve alert
    │
   Yes
    ↓
Alert exists? ──No──> Create new alert
    │
   Yes
    ↓
Update existing
```

### Alert Types
- **TEMP_HIGH**: Lämpötila > 26°C (oletuksena)
- **TEMP_LOW**: Lämpötila < 15°C (oletuksena)
- **OFFLINE**: Ei mittauksia 30 min (oletuksena)
- **ANOMALY**: Epänormaali vaihtelu (tulevaisuudessa)

### Severity Levels
- **INFO**: Lievä poikkeama
- **WARNING**: Merkittävä poikkeama
- **CRITICAL**: Vakava tilanne (>3°C poikkeama)

## API Design

### RESTful Conventions
- **GET**: Hae dataa (ei muuta tilaa)
- **POST**: Luo uusi resurssi
- **PUT**: Päivitä olemassaoleva
- **DELETE**: Poista resurssi

### Response Format
```json
{
  "data": {},           // Onnistunut vastaus
  "error": "message"    // Virhetilanne
}
```

### Error Handling
```typescript
try {
  // Business logic
} catch (error) {
  if (development) {
    return { error: error.message, stack: error.stack }
  }
  return { error: "Internal server error" }
}
```

## Security

### OWASP Top 10 Coverage

1. **Injection**: ✅ Prisma prepared statements
2. **Broken Auth**: ⚠️ Ei autentikointia vielä (tulevaisuudessa)
3. **Sensitive Data**: ✅ Ei tallenneta sensitiivistä dataa
4. **XML External Entities**: ✅ Ei XML-käsittelyä
5. **Broken Access Control**: ⚠️ Tulevaisuudessa
6. **Security Misconfiguration**: ✅ Helmet.js, turvallliset defaultit
7. **XSS**: ✅ React automaattinen escape
8. **Insecure Deserialization**: ✅ JSON-only
9. **Known Vulnerabilities**: ✅ Päivitetyt riippuvuudet
10. **Insufficient Logging**: ✅ Strukturoitu lokitus

## Deployment

### Docker Multi-stage Build

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production
CMD ["node", "dist/server.js"]
```

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string
- **PORT**: Server port (default: 3001)
- **NODE_ENV**: development | production
- **CORS_ORIGIN**: Allowed frontend origin
- **ALERT_***: Hälytysten raja-arvot

## Skalautuvuussuunnitelma

### Horizontal Scaling
1. **Load balancer** (nginx/HAProxy)
2. **Useampi backend-instanssi**
3. **Shared PostgreSQL**
4. **Redis session store**

### Vertical Scaling
1. **Database connection pooling**
2. **Read replicas** (heavy read load)
3. **Caching layer** (Redis)

### Future Improvements
- [ ] GraphQL API (flexible queries)
- [ ] WebSocket (real-time updates)
- [ ] Message queue (async processing)
- [ ] Time-series DB (InfluxDB/TimescaleDB)

## Testing Strategy

### Unit Tests
- Services (business logic)
- Utilities (formatters, calculators)

### Integration Tests
- API endpoints
- Database queries

### E2E Tests
- Critical user flows
- Device creation → Reading → Alert

## Monitoring

### Health Checks
```
GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "environment": "production"
}
```

### Metrics (Future)
- Request latency
- Error rate
- Active devices
- Reading throughput

## Lisensointi

MIT License - Vapaa käyttöön kaupallisesti ja ei-kaupallisesti.

---

Dokumentti päivitetty: 2024
