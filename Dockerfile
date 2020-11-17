FROM node:15.2.0-alpine3.10

WORKDIR '/app'

COPY package.json .

RUN yarn

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]