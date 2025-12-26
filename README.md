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
npm run db:migrate:deploy
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

Projekti on tuotantovalmis ja tukee useita deployment-alustoja. Käytämme **Prisma Migrate** -järjestelmää, joka ajaa migraatiot automaattisesti deploymentissa.

### Option 1: Railway (Suositeltu - Backend + Database)

Railway tarjoaa helpon tavan deployata sekä backend että PostgreSQL-tietokanta.

#### 1. Luo PostgreSQL-tietokanta

```bash
# Railway CLI:llä (valinnainen)
railway init
railway add postgresql
```

Tai Railway dashboardissa: **New Project** → **Provision PostgreSQL**

#### 2. Deploy Backend

**A. GitHub-integraatiolla (suositeltu):**

1. Yhdistä GitHub-repo Railway:hin
2. Valitse `backend` hakemisto root pathiksi
3. Railway tunnistaa Dockerfilen automaattisesti
4. Aseta environment variables (ks. alla)

**B. Railway CLI:llä:**

```bash
cd backend
railway up
```

#### 3. Environment Variables (Railway Backend)

Railway asettaa `DATABASE_URL` automaattisesti. Lisää vain:

```bash
# Railway dashboardissa tai CLI:llä
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
ALERT_TEMP_HIGH=26
ALERT_TEMP_LOW=15
ALERT_OFFLINE_MINUTES=30
```

**HUOM:** Railway antaa automaattisesti `DATABASE_URL`:n kun linkität PostgreSQL-palvelun.

#### 4. Migraatiot ja Seed-data

Migraatiot ajetaan **automaattisesti** Dockerfile CMD:ssä:
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

Seed-datan voi ajaa Railway Shellissä:
```bash
# Railway dashboardissa: Shell-välilehti
cd /app
npm run db:seed
```

#### 5. Healthcheck

Railway:ssa voit asettaa healthcheck URL:ksi:
```
https://your-backend.up.railway.app/health
```

---

### Option 2: Vercel (Frontend)

Vercel on optimoitu React-sovelluksille ja tarjoaa nopean CDN:n.

#### 1. Deploy Vercel CLI:llä

```bash
# Asenna Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### 2. GitHub-integraatiolla (Suositeltu)

1. Yhdistä repo Verceliin: https://vercel.com/new
2. **Root Directory**: `frontend`
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

#### 3. Environment Variables (Vercel)

Vercelin dashboardissa aseta:

```bash
VITE_API_URL=https://your-backend.up.railway.app/api
```

**HUOM:** Muista `/api` polku lopussa!

#### 4. Domain Setup

Vercel antaa automaattisesti domainiin:
```
https://cabin-temp-monitor.vercel.app
```

Voit lisätä custom domainin Vercel dashboardissa.

---

### Option 3: Render.com (Backend + Frontend)

Render on hyvä vaihtoehto ilmaiselle hosting:lle.

#### Backend (Web Service)

1. **New Web Service** → Yhdistä GitHub repo
2. **Root Directory**: `backend`
3. **Environment**: Docker
4. **Instance Type**: Free tai Starter

**Environment Variables:**
```bash
DATABASE_URL=<Render PostgreSQL URL>
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.onrender.com
```

#### PostgreSQL

1. **New PostgreSQL** instance Renderissä
2. Kopioi Internal Database URL
3. Liitä se backend-palvelun `DATABASE_URL`:iin

#### Frontend (Static Site)

1. **New Static Site** → GitHub repo
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Publish Directory**: `dist`

**Environment Variables:**
```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

---

### Option 4: Docker-pohjainen deployment (VPS/Cloud)

Jos käytät omaa serveriä (DigitalOcean, AWS, Azure, etc.):

#### 1. Server Setup

```bash
# Asenna Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Kloonaa repo
git clone https://github.com/2302304/cabin-temp-monitor.git
cd cabin-temp-monitor
```

#### 2. Production Environment Variables

Luo `.env` tiedostot:

**backend/.env:**
```bash
DATABASE_URL=postgresql://postgres:password@postgres:5432/cabin_temp
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
ALERT_TEMP_HIGH=26
ALERT_TEMP_LOW=15
ALERT_OFFLINE_MINUTES=30
```

**frontend/.env:**
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

#### 3. Deploy with Docker Compose

```bash
# Build ja käynnistä
docker-compose up -d --build

# Aja seed-data
docker exec cabin-temp-backend npm run db:seed

# Tarkista lokit
docker-compose logs -f
```

#### 4. Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/cabin-temp-monitor
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

#### 5. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

### Deployment Checklist ✅

Ennen tuotantoon viemistä, varmista:

- [ ] `DATABASE_URL` asetettu ja tietokanta saavutettavissa
- [ ] `CORS_ORIGIN` asetettu oikeaan frontend URL:iin
- [ ] `VITE_API_URL` frontendissä osoittaa backend API:in
- [ ] Migraatiot ajettu (`prisma migrate deploy`)
- [ ] Seed-data ajettu halutessa (`npm run db:seed`)
- [ ] Health endpoint vastaa: `/health`
- [ ] Tietokannalla on persistent storage
- [ ] Environment variables eivät näy GitHubissa (.env gitignoressa)
- [ ] SSL-sertifikaatit asennettu (HTTPS)

---

### Post-Deployment

#### Testaa API

```bash
# Health check
curl https://your-backend.up.railway.app/health

# Hae laitteet
curl https://your-backend.up.railway.app/api/devices

# Hae viimeisimmät mittaukset
curl https://your-backend.up.railway.app/api/readings/latest
```

#### Tietokannan hallinta

```bash
# Railway Shell tai SSH
npm run db:studio  # Avaa Prisma Studio
npm run db:migrate:status  # Tarkista migraatiot
```

#### Monitoring

- Railway: Built-in metrics ja lokit
- Vercel: Analytics ja Web Vitals
- Render: Logs ja metrics dashboardissa

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
