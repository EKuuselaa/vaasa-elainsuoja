const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;
const DB_PATH = process.env.DATABASE_PATH || './animals.db';
const SERVER_B_URL = process.env.SERVER_B_URL || 'http://localhost:5000';

app.use(cors());
app.use(express.json());

// Tietokanta-asetukset
let db;

// Alusta tietokanta
function initDatabase() {
  return new Promise((resolve, reject) => {
    // Varmista että data-kansio on olemassa
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Virhe tietokannan avaamisessa:', err);
        reject(err);
        return;
      }
      console.log('Yhdistetty SQLite-tietokantaan');

      // Luo taulut
      db.run(`CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        age INTEGER NOT NULL,
        breed TEXT,
        description TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'available'
      )`, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Tarkista onko dataa jo olemassa
        db.get('SELECT COUNT(*) as count FROM animals', (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          // Jos ei ole dataa, lisää esimerkkidataa
          if (row.count === 0) {
            console.log('Lisätään esimerkkidataa...');
            const animals = [
              {
                name: 'Musti',
                type: 'koira',
                age: 3,
                breed: 'Sekarotuinen',
                description: 'Musti on energinen ja leikkisä koira, joka rakastaa ulkoilua ja pitkiä kävelylenkkejä. Sopii aktiiviseen perheeseen.',
                image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
                status: 'available'
              },
              {
                name: 'Mirri',
                type: 'kissa',
                age: 2,
                breed: 'Maatiaiskissa',
                description: 'Mirri on rauhallinen ja hellyyttä rakastava kissa. Viihtyy hyvin sisällä ja on hyvä kaveri myös lapsille.',
                image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
                status: 'available'
              },
              {
                name: 'Rex',
                type: 'koira',
                age: 5,
                breed: 'Saksanpaimenkoira',
                description: 'Rex on uskollinen ja älykäs koira. Hän on tottunut lapsiin ja muihin eläimiin. Kaipaa aktiivista omistajaa.',
                image_url: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400',
                status: 'available'
              },
              {
                name: 'Kissa',
                type: 'kissa',
                age: 1,
                breed: 'Siamilainen',
                description: 'Nuori ja utelias siamilainen kissa. Rakastaa leikkimistä ja on erittäin sosiaalinen. Äänekäs toveri!',
                image_url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
                status: 'available'
              },
              {
                name: 'Nalle',
                type: 'koira',
                age: 7,
                breed: 'Kultainennoutaja',
                description: 'Nalle on rauhallinen ja ystävällinen vanhempi koira. Hän nauttii rauhallisista lenkkeistä ja rentoilusta sohvalla.',
                image_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
                status: 'available'
              },
              {
                name: 'Viiru',
                type: 'kissa',
                age: 4,
                breed: 'Eurooppalainen lyhytkarva',
                description: 'Viiru on itsenäinen mutta lempeä kissa. Sopii hyvin myös yksinasuvalle, sillä viihtyy hyvin omissa oloissaan.',
                image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
                status: 'available'
              }
            ];

            const stmt = db.prepare(`INSERT INTO animals (name, type, age, breed, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            
            animals.forEach(animal => {
              stmt.run(animal.name, animal.type, animal.age, animal.breed, animal.description, animal.image_url, animal.status);
            });

            stmt.finalize(() => {
              console.log('Esimerkkidata lisätty!');
              resolve();
            });
          } else {
            console.log('Tietokannassa on jo dataa');
            resolve();
          }
        });
      });
    });
  });
}

// GET /animals - Palauta kaikki eläimet
app.get('/animals', (req, res) => {
  db.all('SELECT * FROM animals WHERE status = ?', ['available'], (err, rows) => {
    if (err) {
      console.error('Virhe haettaessa eläimiä:', err);
      return res.status(500).json({ error: 'Virhe tietokannan haussa' });
    }
    res.json(rows);
  });
});

// GET /animals/:id - Palauta yhden eläimen tiedot
app.get('/animals/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Virhe haettaessa eläintä:', err);
      return res.status(500).json({ error: 'Virhe tietokannan haussa' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    }
    
    res.json(row);
  });
});

// POST /animals/:id/adopt - Vastaanota adoptiohakemus
app.post('/animals/:id/adopt', async (req, res) => {
  const { id } = req.params;
  const adoptionData = req.body;

  try {
    // Tarkista että eläin on olemassa ja adoptoitavissa
    const animal = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!animal) {
      return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    }

    if (animal.status === 'adopted') {
      return res.status(400).json({ error: 'Tämä eläin on jo adoptoitu' });
    }

    // Lähetä adoptiohakemus Server B:lle
    console.log(`Lähetetään adoptiohakemus Server B:lle (${SERVER_B_URL}/adoptions)...`);
    
    const response = await axios.post(`${SERVER_B_URL}/adoptions`, {
      animalId: id,
      animalName: animal.name,
      ...adoptionData
    });

    // Jos Server B vahvisti, päivitä eläimen status
    if (response.data.success) {
      await new Promise((resolve, reject) => {
        db.run('UPDATE animals SET status = ? WHERE id = ?', ['adopted', id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`Eläin ${animal.name} (ID: ${id}) adoptoitu onnistuneesti!`);
      
      res.json({
        success: true,
        message: 'Adoptiohakemus lähetetty onnistuneesti!',
        animal: animal.name,
        adoptionId: response.data.adoptionId
      });
    } else {
      res.status(500).json({ error: 'Adoptiopalvelin ei vahvistanut hakemusta' });
    }

  } catch (error) {
    console.error('Virhe adoptiossa:', error.message);
    res.status(500).json({ 
      error: 'Virhe adoptioprosessissa',
      details: error.message 
    });
  }
});

// Käynnistä palvelin
initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server A käynnissä portissa ${PORT}`);
      console.log(`Server B URL: ${SERVER_B_URL}`);
    });
  })
  .catch(err => {
    console.error('Virhe tietokannan alustuksessa:', err);
    process.exit(1);
  });