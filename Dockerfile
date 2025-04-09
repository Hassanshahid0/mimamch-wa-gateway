# FROM node:22.14.0

# WORKDIR /app

# # Update the package list and install prerequisites
# RUN apt-get update

# # install dependencies and start the app
# CMD ["sh", "-c", "npm install && npm start"]



FROM node:22.14.0

WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Define the command to run the application
CMD ["npm", "start"]
