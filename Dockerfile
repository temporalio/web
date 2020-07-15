FROM node:8.17.0-jessie as builder
WORKDIR /usr/build

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .
# Bundle the client code
RUN npm run build-production


# Build final image
FROM node:8.17.0-jessie-slim
WORKDIR /usr/app

COPY --from=builder ./usr/build ./

ENV NODE_ENV=production
ENV NPM_CONFIG_PRODUCTION=true
EXPOSE 8088
CMD [ "node", "server.js" ]