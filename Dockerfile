FROM node:8-alpine
WORKDIR /srv
COPY . .
RUN npm install --production
CMD [ "node", "index.js" ]
EXPOSE 3003