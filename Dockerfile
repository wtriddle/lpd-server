# NodeJS GraphQL (Apollo based) Postgres SQL connected server backend virtual machine build contruction file instructions
# Initialization of the environemnt for the virtual machine and the app to run in

# Retrieve the alpine linux distribution image with node
FROM node:alpine

# Set the working directory in the VM
WORKDIR /usr/app

# Copy necessary build files
# package.json & yarn.lock lists all required build packages for the app
COPY package.json ./
COPY yarn.lock ./

# Install yarn tool & install packages through yarn
RUN apk add yarn
RUN yarn install

# Copy all source files & directories 
COPY . .

# Set the environment
COPY .env.prod .env

# Build the project
RUN yarn build

# Specify the Port and Runtime for server envrionemnt
EXPOSE 4000
CMD ["node", "dist/index.js"]