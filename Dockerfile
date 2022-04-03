FROM node:17-alpine AS BUILD_IMAGE
COPY . /app/
WORKDIR /app
RUN npm install --production
# remove development dependencies
RUN npm prune --production

FROM node:17-alpine
ARG GIT_REF
ENV GIT_REF ${GIT_REF}
ENV PORT=8000
EXPOSE $PORT
WORKDIR /app
COPY --from=BUILD_IMAGE /app/src example ./
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
CMD ["node", "index.js"]
