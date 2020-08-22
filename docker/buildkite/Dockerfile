FROM node:14.8.0-slim

WORKDIR /usr/temporal-web

ENV NODE_ENV=development

# Install app dependencies
COPY package*.json ./
RUN yarn install

# Bundle app source
COPY . .

# Bundle the client code
RUN yarn build