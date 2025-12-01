const express = require('express');
const path = require('path');

const app = express();
const PORT = 80;

// Tarjoa staattiset tiedostot public-kansiosta
app.use(express.static('public'));

// Kaikki muut reitit palauttavat index.html (SPA-tuki)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend palvelin käynnissä portissa ${PORT}`);
});