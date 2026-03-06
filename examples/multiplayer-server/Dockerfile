FROM node:20-alpine

WORKDIR /app

COPY examples/multiplayer-server/package*.json ./examples/multiplayer-server/
RUN cd examples/multiplayer-server && npm install

COPY chess-engine ./chess-engine
COPY src ./src
COPY examples/multiplayer-server ./examples/multiplayer-server

WORKDIR /app/examples/multiplayer-server
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
