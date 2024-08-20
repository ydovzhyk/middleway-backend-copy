FROM node:20.16.0

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 4000:4000

CMD ["npm", "start"]