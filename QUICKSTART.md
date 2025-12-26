# 🚀 Pika-aloitus: Kesämökin Lämpötilaseuranta

## Nopein tapa (Docker Compose)

```bash
# 1. Käynnistä kaikki palvelut
docker-compose up --build

# 2. Odota että palvelut käynnistyvät (n. 1-2 min)
# 3. Avaa selaimessa: http://localhost:3000
```

Tämän jälkeen näet:
- ✅ 4 simuloitua laitetta (Olohuone, Makuuhuone, Sauna, Ulko)
- ✅ 30 päivän historiaa jokaiselle laitteelle
- ✅ Realistista dataa vuorokausivaihteluilla
- ✅ Muutamia hälytyksiä demonstraatiota varten

## Kehitysympäristö (Local)

### Vaatimukset
- Node.js 20+
- PostgreSQL (tai Docker PostgreSQL)

### Backend

```bash
# Siirry backend-hakemistoon
cd backend

# Asenna riippuvuudet
npm install

# Luo .env tiedosto
cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cabin_temp"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF

# Käynnistä PostgreSQL (jos ei ole jo käynnissä)
docker run -d \
  --name postgres-cabin \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cabin_temp \
  -p 5432:5432 \
  postgres:16-alpine

# Luo tietokanta ja seed-data
npm run db:push
npm run db:seed

# Käynnistä dev-server
npm run dev

# Backend pyörii nyt osoitteessa http://localhost:3001
```

### Frontend

```bash
# Uudessa terminaali-ikkunassa, siirry frontend-hakemistoon
cd frontend

# Asenna riippuvuudet
npm install

# Käynnistä dev-server
npm run dev

# Frontend pyörii nyt osoitteessa http://localhost:5173
```

## Testaa API:a

### Hae viimeisimmät mittaukset
```bash
curl http://localhost:3001/api/readings/latest
```

### Hae aktiiviset hälytykset
```bash
curl http://localhost:3001/api/alerts
```

### Lähetä uusi mittaus (simuloi IoT-laitetta)
```bash
# Hae ensin device ID
DEVICE_ID=$(curl -s http://localhost:3001/api/devices | jq -r '.[0].id')

# Lähetä mittaus
curl -X POST http://localhost:3001/api/readings \
  -H "Content-Type: application/json" \
  -d "{
    \"deviceId\": \"$DEVICE_ID\",
    \"temperature\": 22.5,
    \"humidity\": 55
  }"
```

## Testaa IoT-simulaattori

```bash
# Hae device ID
DEVICE_ID=$(curl -s http://localhost:3001/api/devices | jq -r '.[0].id')

# Käynnistä simulaattori
node simulate-iot.js $DEVICE_ID

# Simulaattori lähettää mittauksia minuutin välein
# Paina Ctrl+C lopettaaksesi
```

## Yleiset ongelmat

### "Port 5432 already in use"
PostgreSQL on jo käynnissä. Käytä olemassaolevaa tai vaihda portti.

### "Connection refused" backendin käynnistyessä
Odota että PostgreSQL on täysin käynnistynyt (health check).

### Frontend ei näe backendia
Tarkista että backend pyörii ja CORS_ORIGIN on oikein .env:ssä.

### Data ei päivity frontendissä
Frontend päivittyy automaattisesti 30s välein. Voit myös painaa "Päivitä"-nappia.

## Seuraavat askeleet

1. **Tutki koodia**: Katso `backend/src/` ja `frontend/src/`
2. **Muokkaa seed-dataa**: `backend/prisma/seed.ts`
3. **Lisää omia laitteita**: Käytä POST `/api/devices`
4. **Kokeile eri aikavälejä**: Frontend → Klikkaa laitetta → Vaihda aikaväliä
5. **Lue täysi README**: `README.md` sisältää kaiken dokumentaation

## Pysäytä palvelut

### Docker
```bash
docker-compose down

# Tai poista myös data
docker-compose down -v
```

### Local
```bash
# Paina Ctrl+C molemmissa terminaaleissa (backend & frontend)

# Pysäytä PostgreSQL
docker stop postgres-cabin
```

## Hyödyllisiä komentoja

```bash
# Tietokannan tarkastelu (Prisma Studio)
cd backend
npm run db:studio

# Nollaa tietokanta ja luo uusi seed-data
cd backend
npm run db:reset
npm run db:seed

# Katso backend-lokit
docker-compose logs -f backend

# Buildaa production-versiot
docker-compose build --no-cache
```

---

**Ongelmia?** Avaa issue GitHubissa tai tarkista README.md
