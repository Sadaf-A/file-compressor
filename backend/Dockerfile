# Use the official Node.js 14 image
FROM node:21

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Change directory to src and run the Node.js server
CMD ["sh", "-c", "cd src && node server.js"]
