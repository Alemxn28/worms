FROM node:20.12.2-alpine3.19

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "broker.js" ]