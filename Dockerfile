FROM node:8.11
WORKDIR /app

COPY package* ./
RUN npm install

COPY scripts ./scripts
COPY webpack.config.js ts*.json ./
COPY src ./src

CMD ["npm", "start"]
