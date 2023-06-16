FROM node:14 as base

WORKDIR /var/www/360server

# Copy package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .
COPY /etc/letsencrypt/live/360tv.net/privkey.pem /etc/letsencrypt/live/360tv.net/privkey.pem
COPY /etc/letsencrypt/live/360tv.net/fullchain.pem /etc/letsencrypt/live/360tv.net/fullchain.pem
# Expose ports
EXPOSE 9222
EXPOSE 5000

# Start the application in development mode
CMD ["npm", "run", "debug"]
