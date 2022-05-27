FROM node:14.19-alpine
WORKDIR /usr/temporal-web

# install git & openssh to fetch github packages
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

ENV NODE_ENV=development

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Bundle the client code
RUN npm run build
