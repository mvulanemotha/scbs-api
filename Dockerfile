#nodejs image
FROM node:20.16-alpine3.19

# setting my linux working directory
WORKDIR /scbsserver

#Copy the package.json file to be used by node package manager
COPY package*.json ./

# Install dependencies
RUN npm Install

# Copy the rest of the application
COPY . .

# Expose the post the app is running on

CMD ["node" , "server.js"]