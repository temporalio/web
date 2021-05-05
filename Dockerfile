FROM node:14.16-alpine as builder
WORKDIR /usr/build

# install git & openssh to fetch github packages
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .
# Bundle the client code
RUN npm run build-production


# Build final image
FROM node:14.16-alpine
WORKDIR /usr/app

COPY --from=builder ./usr/build ./

ENV NODE_ENV=production
ENV NPM_CONFIG_PRODUCTION=true
EXPOSE 8088
CMD [ "node", "server.js" ]