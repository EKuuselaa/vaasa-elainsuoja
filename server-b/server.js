const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_PATH = process.env.DATABASE_PATH || './adoptions.db';

app.use(cors());
app.use(express.json());

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
      console.log('Yhdistetty Adoptio-tietokantaan');

      // Luo adoptiotaulu
      db.run(`CREATE TABLE IF NOT EXISTS adoptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_id INTEGER NOT NULL,
        animal_name TEXT NOT NULL,
        adopter_name TEXT NOT NULL,
        adopter_email TEXT NOT NULL,
        adopter_phone TEXT,
        adopter_address TEXT,
        adoption_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending'
      )`, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('Adoptiotaulu luotu/varmistettu');
        resolve();
      });
    });
  });
}

// POST /adoptions - Vastaanota adoptiohakemus
app.post('/adoptions', (req, res) => {
  const { animalId, animalName, adopterName, adopterEmail, adopterPhone, adopterAddress } = req.body;

  // Validoi pakolliset kentät
  if (!animalId || !animalName || !adopterName || !adopterEmail) {
    return res.status(400).json({ 
      success: false,
      error: 'Puuttuvia pakollisia tietoja (animalId, animalName, adopterName, adopterEmail)' 
    });
  }

  // Tarkista onko sama eläin jo adoptoitu
  db.get('SELECT * FROM adoptions WHERE animal_id = ? AND status = ?', [animalId, 'confirmed'], (err, row) => {
    if (err) {
      console.error('Virhe tarkistettaessa adoptiota:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Virhe tietokannan haussa' 
      });
    }

    if (row) {
      return res.status(400).json({ 
        success: false,
        error: 'Tämä eläin on jo adoptoitu' 
      });
    }

    // Tallenna adoptiohakemus
    const stmt = db.prepare(`
      INSERT INTO adoptions (animal_id, animal_name, adopter_name, adopter_email, adopter_phone, adopter_address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(animalId, animalName, adopterName, adopterEmail, adopterPhone, adopterAddress, 'confirmed', function(err) {
      if (err) {
        console.error('Virhe tallennettaessa adoptiota:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Virhe tallennettaessa adoptiota' 
        });
      }

      const adoptionId = this.lastID;
      console.log(`Uusi adoptio tallennettu: ID ${adoptionId}, Eläin: ${animalName}, Adoptoija: ${adopterName}`);

      res.json({
        success: true,
        message: 'Adoptiohakemus vastaanotettu ja vahvistettu',
        adoptionId: adoptionId,
        animalName: animalName,
        adopterName: adopterName
      });
    });

    stmt.finalize();
  });
});

// GET /adoptions - Hae kaikki adoptiot (bonus-endpoint hallintaa varten)
app.get('/adoptions', (req, res) => {
  db.all('SELECT * FROM adoptions ORDER BY adoption_date DESC', (err, rows) => {
    if (err) {
      console.error('Virhe haettaessa adoptioita:', err);
      return res.status(500).json({ error: 'Virhe tietokannan haussa' });
    }
    res.json(rows);
  });
});

// Käynnistä palvelin
initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server B (Adoptiopalvelin) käynnissä portissa ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Virhe tietokannan alustuksessa:', err);
    process.exit(1);
  });