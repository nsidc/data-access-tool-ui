FROM node:26.10.0
WORKDIR /app

COPY package* ./
RUN npm install

COPY scripts ./scripts
COPY .eslintrc.json webpack.config.cjs ts*.json ./
COPY src ./src

CMD ["npm", "start"]
