FROM node:17-alpine AS BUILD_IMAGE
COPY . /app
WORKDIR /app
RUN npm install --production
# remove development dependencies
RUN npm prune --production

FROM node:17-alpine
ARG GIT_REF
ENV GIT_REF ${GIT_REF}
ENV PORT=8000
EXPOSE $PORT
COPY --from=BUILD_IMAGE /app/index.js /app/
COPY --from=BUILD_IMAGE /app/src /app/src
COPY --from=BUILD_IMAGE /app/example /app/example
COPY --from=BUILD_IMAGE /app/node_modules /app/node_modules
WORKDIR /app
CMD ["node", "index.js"]
