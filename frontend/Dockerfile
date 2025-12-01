FROM node:18-alpine

WORKDIR /app

# Kopioi package.json ja asenna riippuvuudet
COPY package.json ./
RUN npm install

# Kopioi sovelluksen tiedostot
COPY . .

# Altista portti
EXPOSE 80

# Käynnistä palvelin
CMD ["npm", "start"]