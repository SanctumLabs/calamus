FROM node:13

# setting working directory in the container
WORKDIR /usr/src/app

# grant permission of node project directory to node user
COPY build/server.js server.js
COPY keys keys
COPY package.json package.json
COPY ecosystem.config.js ecosystem.config.js

RUN npm install --production
RUN npm install pm2 -g

# container exposed network port number
EXPOSE 3000

# command to run within the container
CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]