FROM node:22-alpine
ENV APP_DIR=/fuzzer-seeder
ENV FUZZER_SEEDER_PORT=8080
WORKDIR ${APP_DIR}
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE ${FUZZER_SEEDER_PORT}
CMD ["npm", "start"]