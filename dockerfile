FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000

# Start the app
CMD ["npx", "nodemon", "server.js"]

