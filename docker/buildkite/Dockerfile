FROM node:dubnium

WORKDIR /usr/temporal-web

ENV NODE_ENV=development

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Bundle the client code
RUN npm run build