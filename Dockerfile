FROM node:17-alpine

ARG GIT_REF
ENV GIT_REF ${GIT_REF}

ENV PORT=8000

EXPOSE $PORT

COPY package*.json index.js src example /app/

WORKDIR /app

RUN npm install --production

CMD ["node", "index.js"]
