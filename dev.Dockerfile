# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /t4_front


# install and cache app dependencies
COPY package.json /t4_front/package.json
RUN npm install
RUN npm install @vue/cli@3.7.0 &&\
npm install webpack-dev-server

# RUN ln -s /t4_front/node_modules /usr/local/lib/node_modules

# add `/t4_front/node_modules/` to $PATH
ENV PATH /t4_front/node_modules/:$PATH
ENV PATH /usr/local/lib/node_modules:$PATH

EXPOSE 8080

# start app
CMD ["npm", "run", "dev"]
