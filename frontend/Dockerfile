FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/ \
  && npm config set fetch-retries 10 \
  && npm config set fetch-retry-mintimeout 30000 \
  && npm config set fetch-retry-maxtimeout 180000 \
  && npm ci --no-audit --no-fund

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]