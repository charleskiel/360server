FROM node:14 as base

WORKDIR /

COPY ./package.json ./

RUN npm install 

FROM base as production

ENV NODE_PATH=./build

RUN npm run debug

# RUN yarn install --dev  # installs our app dev dependencies

EXPOSE 9222