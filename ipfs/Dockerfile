FROM node:12

WORKDIR /app/src
RUN mkdir /app/orbitdb

COPY /ipfs/package.json /app

RUN npm install

EXPOSE 8080
