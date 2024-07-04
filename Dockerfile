# Usa un'immagine base ufficiale di Node.js 20
FROM node:20

RUN apt-get update \
 && apt-get install -y -q --no-install-recommends \
    git \
    openssh-client \
    ca-certificates \
 && apt-get clean \
 && rm -r /var/lib/apt/lists/* /var/cache/*

RUN git clone https://github.com/alessandrocolla/activity-tracker-backend/

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia il package.json e il package-lock.json (se esiste)
COPY ./activity-tracker-backend/package*.json ./

# Copia il config.env (se esiste)
COPY ./activity-tracker-backend/config.env ./

# Installa le dipendenze
RUN npm install

# Copia il resto del codice dell'applicazione
COPY * ./

# Espone la porta su cui l'applicazione è in esecuzione
EXPOSE 3000

# Definisce il comando per avviare l'applicazione
CMD ["npm", "start"]
