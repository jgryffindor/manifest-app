# Use Node.js as the base image
FROM node:20.10

# Install bun 
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to the PATH
ENV PATH="/root/.bun/bin:$PATH"

# Verify Bun installation
RUN bun --version

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm config set registry https://registry.npmjs.org/
RUN bun install 

# Copy the rest of the application code to the working directory
COPY . .

# Creates a "dist" folder with the production build
RUN bun run build 

EXPOSE 3000

# Start the server using the production build
CMD [ "npm", "start" ]