FROM node:18-alpine

WORKDIR /app

# Kopioi package.json ja asenna riippuvuudet
COPY package.json ./
RUN npm install

# Kopioi sovelluksen koodi
COPY . .

# Altista portti
EXPOSE 4000

# Käynnistä sovellus
CMD ["npm", "start"]