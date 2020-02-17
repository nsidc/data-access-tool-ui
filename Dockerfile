FROM node:13.8.0
WORKDIR /app

COPY package* ./
RUN npm install

COPY scripts ./scripts
COPY .stylelintrc webpack.config.js ts*.json ./
COPY src ./src

CMD ["npm", "start"]
