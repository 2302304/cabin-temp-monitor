# 🏡 Kesämökin Lämpötilaseurantajärjestelmä

Ammattitasoinen full stack -sovellus kesämökin lämpötilan ja kosteuden reaaliaikaiseen seurantaan. Järjestelmä on suunniteltu alusta alkaen IoT-valmiiksi, mutta käyttää alkuvaiheessa realistista simuloitua dataa.

## 🌟 Ominaisuudet

### Backend
- **RESTful API** Express.js + TypeScript
- **PostgreSQL** tietokanta Prisma ORM:llä
- **Aikasarja-data** optimoidulla indeksoinnilla
- **Realistinen data-simulaatio**
  - Vuorokausivaihtelut (päivä/yö-syklit)
  - Säätilan simulointi
  - Satunnaiset mittauskatkokset (1% todennäköisyys)
  - Poikkeavat arvot (2% todennäköisyys)
- **Automaattinen hälytysjärjestelmä**
  - Lämpötilan raja-arvot
  - Offline-hälytykset
  - Kolme vakavuustasoa (INFO, WARNING, CRITICAL)
- **Tilastotoiminnot**
  - Min/max/keskiarvo laskenta
  - Päiväkohtaiset aggregaatit
  - Historiadata eri aikaväleille

### Frontend
- **React 18** + TypeScript
- **Recharts** historiakäyrät
- **TailwindCSS** moderneilla UI-komponenteilla
- **Reaaliaikainen päivitys** 30s välein
- **Responsiivinen design** mobiili & desktop
- **Interaktiiviset komponentit**
  - Laitteiden status-kortit
  - Yksityiskohtaiset historiakäyrät
  - Hälytysten hallinta
  - Aikavälin valinta (1h - 1v)

### Infrastruktuuri
- **Docker Compose** helppoa deploymenttia varten
- **Multi-stage builds** optimoitu image-koko
- **Health checks** palveluiden valvontaan
- **Persistent volumes** datan säilyvyys

## 📋 Vaatimukset

- Node.js 20+
- Docker & Docker Compose (suositeltava)
- PostgreSQL 16+ (jos ajat ilman Dockeria)

## 🚀 Pika-aloitus (Docker)

### 1. Kloonaa repositorio ja siirry hakemistoon

```bash
cd cabin-temp-monitor
```

### 2. Käynnistä kaikki palvelut

```bash
docker-compose up --build
```

Tämä:
- Käynnistää PostgreSQL-tietokannan
- Buildaa ja käynnistää backend-palvelun
- Ajaa tietokannan migraatiot
- Luo seed-datan (30 päivän historia, 4 laitetta)
- Buildaa ja käynnistää frontend-palvelun

### 3. Avaa sovellus

Frontend: http://localhost:3000
Backend API: http://localhost:3001
API Health: http://localhost:3001/health

## 🔧 Kehitysympäristö (ilman Dockeria)

### Backend

```bash
cd backend

# Asenna riippuvuudet
npm install

# Kopioi .env tiedosto
cp .env.example .env

# Käynnistä PostgreSQL (Docker)
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cabin_temp \
  -p 5432:5432 \
  postgres:16-alpine

# Aja migraatiot ja seed
npm run db:push
npm run db:seed

# Käynnistä dev-server
npm run dev
```

### Frontend

```bash
cd frontend

# Asenna riippuvuudet
npm install

# Kopioi .env tiedosto
cp .env.example .env

# Käynnistä dev-server
npm run dev
```

## 📡 API Endpoints

### Devices

- `GET /api/devices` - Hae kaikki laitteet
- `GET /api/devices/:id` - Hae laite ID:llä
- `GET /api/devices/:id/status` - Hae laitteen tila
- `POST /api/devices` - Luo uusi laite (IoT-valmis)
- `PUT /api/devices/:id` - Päivitä laite
- `DELETE /api/devices/:id` - Poista laite

### Readings

- `GET /api/readings/latest` - Viimeisimmät mittaukset kaikilta laitteilta
- `GET /api/readings/device/:deviceId?timeRange=day` - Laitteen historia
  - timeRange: `hour` | `day` | `week` | `month` | `year`
- `GET /api/readings/device/:deviceId/stats?days=7` - Tilastot
- `POST /api/readings` - Tallenna uusi mittaus (IoT-laitteelle)

```json
{
  "deviceId": "uuid",
  "temperature": 21.5,
  "humidity": 55
}
```

### Alerts

- `GET /api/alerts` - Aktiiviset hälytykset
- `GET /api/alerts/device/:deviceId?includeResolved=false` - Laitteen hälytykset
- `PUT /api/alerts/:id/resolve` - Merkitse hälytys ratkaistuksi
- `PUT /api/alerts/device/:deviceId/resolve-all` - Ratkaise kaikki

## 🗄️ Tietokantamalli

```
Device (Laite)
├── id (UUID)
├── name (Nimi)
├── location (Sijainti)
├── deviceType (SEED | IOT)
├── isActive (Aktiivinen)
└── lastSeen (Viimeksi nähty)

Reading (Mittaus)
├── id (UUID)
├── deviceId (Viittaus laitteeseen)
├── temperature (Lämpötila)
├── humidity (Kosteus)
├── timestamp (Aikaleima)
└── quality (GOOD | WARNING | ERROR)

Alert (Hälytys)
├── id (UUID)
├── deviceId (Viittaus laitteeseen)
├── alertType (TEMP_HIGH | TEMP_LOW | OFFLINE | ANOMALY)
├── severity (INFO | WARNING | CRITICAL)
├── message (Viesti)
├── value (Arvo)
├── threshold (Raja-arvo)
├── isResolved (Ratkaistu)
└── resolvedAt (Ratkaisuaika)
```

## 🔄 Siirtyminen oikeisiin IoT-laitteisiin

Järjestelmä on suunniteltu helppoa laajennusta varten:

### 1. Lisää uusi IoT-laite

```bash
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ESP32 Olohuone",
    "location": "Olohuone",
    "deviceType": "IOT"
  }'
```

### 2. Lähetä mittauksia laitteelta

```javascript
// ESP32 / Arduino / Raspberry Pi
const deviceId = "laite-uuid-tasta";

setInterval(async () => {
  const temp = readTemperatureSensor();
  const humidity = readHumiditySensor();
  
  await fetch('http://your-server:3001/api/readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId,
      temperature: temp,
      humidity
    })
  });
}, 60000); // Joka minuutti
```

### 3. Poista seed-laitteet (valinnainen)

Kun oikeat laitteet ovat käytössä, voit poistaa simuloidut laitteet:

```sql
DELETE FROM "Device" WHERE "deviceType" = 'SEED';
```

## 🎨 UI-komponentit

### DeviceCard
- Näyttää laitteen nykyisen tilan
- Lämpötila väreindikaattorilla
- Viimeisin päivitysaika
- Kosteus (jos saatavilla)

### DeviceDetail
- Yksityiskohtainen modal-näkymä
- Historiakäyrä (Recharts)
- Tilastot (min/max/avg)
- Aktiiviset hälytykset
- Aikavälivalitsin

### AlertBadge
- Värikoodatut hälytykset
- Vakavuustasot
- Ratkaisu-toiminto
- Aikaleima

## 🔐 Turvallisuus

- Helmet.js suojaa HTTP-headerit
- CORS rajoitus määriteltyihin origineihin
- Input validointi
- Prepared statements (Prisma) SQL-injektioita vastaan
- Error handling tuotantoa varten

## 📊 Suorituskyky

- Indeksoidut tietokantakyselyt (deviceId + timestamp)
- Aggregaattien välimuisti
- Compression middleware
- Optimoidut Docker-imaget (multi-stage builds)
- Recharts lazy loading

## 🧪 Testaaminen

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🚢 Deployment

### Railway

1. Luo uusi PostgreSQL-tietokanta Railway:ssa
2. Lisää backend-palvelu
3. Aseta environment variables:
   - `DATABASE_URL` (Railway antaa automaattisesti)
   - `CORS_ORIGIN` (frontend URL)
4. Deploy frontend Verceliin tai Railway:hin

### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

Aseta environment variable:
- `VITE_API_URL` → Backend URL

## 🐛 Debugging

```bash
# Katso lokit
docker-compose logs -f

# Katso tietokantaa
cd backend
npm run db:studio

# Tietokannan tila
docker exec -it cabin-temp-db psql -U postgres cabin_temp
```

## 🤝 Kontribuutiot

Kehitysehdotukset ovat tervetulleita! Tee issue tai pull request.

## 📝 Lisenssi

MIT

## 🎯 Roadmap

- [ ] WebSocket tuki reaaliaikaisille päivityksille
- [ ] Push-notifikaatiot (PWA)
- [ ] Käyttäjien hallinta ja autentikaatio
- [ ] Exporttaa dataa CSV/Excel
- [ ] Graafinen editori hälytyksille
- [ ] MQTT-tuki IoT-laitteille
- [ ] Mobiilikäyttöliittymä (React Native)
- [ ] Machine learning -poikkeamien tunnistukseen

---

**Rakennettu ❤️:llä Suomessa**
