# Vaasan Eläinsuoja - Adoptiosovellus

Moderni web-sovellus eläinten adoption helpottamiseksi.

## 🏗️ Arkkitehtuuri

Sovellus koostuu kolmesta Docker-kontista:

- **Frontend**: React-tyylinen SPA-sovellus (Vanilla JS)
- **Server A**: Pääpalvelin - API Gateway & eläintietojen hallinta
- **Server B**: Adoptiopalvelin - Adoptiohakemusten käsittely

## 📋 Esivalmistelut

Varmista että sinulla on asennettuna:
- Docker Desktop (Windows/Mac) tai Docker Engine (Linux)
- Docker Compose
- Git

## 🚀 Käynnistys

1. Kloonaa repositorio:
```bash
git clone <repository-url>
cd vaasan-elainsuoja
```

2. Käynnistä kaikki palvelut:
```bash
docker-compose up --build
```

3. Avaa selain osoitteessa:
```
http://localhost:3000
```

## 🎯 Toiminnallisuudet

### Käyttäjälle näkyvät ominaisuudet:
- ✅ Selaa kaikkia adoptoitavia eläimiä
- ✅ Tutustuu eläimen yksityiskohtiin
- ✅ Jättää adoptiohakemuksen
- ✅ Saa välittömän vahvistuksen

### Tekniset ominaisuudet:
- ✅ Mikropalveluarkkitehtuuri
- ✅ REST API
- ✅ SQLite-tietokannat
- ✅ Docker-konttipohjainen deployment
- ✅ Automaattinen datan alustus
- ✅ Palvelinten välinen kommunikaatio

## 🔗 API-endpointit

### Server A (Port 4000)
- `GET /animals` - Hae kaikki eläimet
- `GET /animals/:id` - Hae yhden eläimen tiedot
- `POST /animals/:id/adopt` - Lähetä adoptiohakemus

### Server B (Port 5000)
- `POST /adoptions` - Vastaanota adoptiohakemus
- `GET /adoptions` - Hae kaikki adoptiot (bonus)

## 🛠️ Kehityskomennot

### Käynnistä palvelut
```bash
docker-compose up --build
```

### Pysäytä palvelut
```bash
docker-compose down
```

### Pysäytä ja poista kaikki data
```bash
docker-compose down -v
```

### Seuraa lokeja
```bash
docker-compose logs -f
```

### Yksittäisen palvelun lokit
```bash
docker-compose logs -f server-a
docker-compose logs -f server-b
docker-compose logs -f frontend
```

## 📝 Lisenssi

Tämä projekti on tehty opetuskäyttöön Vaasan Eläinsuoja ry:lle.

## 🤝 Tekijä

Projekti on toteutettu osana ohjelmistotuotannon kurssia.

Jos kohtaat ongelmia:

1. Tarkista että Docker on käynnissä
2. Tarkista että portit 3000, 4000 ja 5000 ovat vapaana
3. Katso lokit: `docker-compose logs`
4. Käynnistä uudelleen: `docker-compose down && docker-compose up --build`
