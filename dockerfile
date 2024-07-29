FROM node:21-alpine3.18

WORKDIR /

COPY . . 

RUN mkdir -p logs

RUN npm install

CMD ["npm", "start"]

EXPOSE 8000

