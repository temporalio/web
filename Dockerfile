FROM node:8.17.0-jessie as builder

WORKDIR /usr/build
ENV NODE_ENV=production
ENV NPM_CONFIG_PRODUCTION=true

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .
# Bundle the client code
RUN npm run build-production
RUN mkdir app && mv package.json server.js webpack.config.js .babelrc server dist node_modules temporal-proto ./app
RUN mkdir -p ./app/protobuf/src && mv protobuf/src ./app/protobuf

# Build final image
FROM node:8.17.0-jessie-slim
WORKDIR /usr/app
COPY --from=builder ./usr/build/app ./
EXPOSE 8088
CMD [ "node", "server.js" ]