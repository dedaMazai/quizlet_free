# Stage 1: Build the application
FROM node:22-alpine AS build

ARG APP_VERSION=dev

WORKDIR /app

ENV APP_VERSION=${APP_VERSION}

# Copy package.json and package-lock.json to install dependencies
COPY package-lock.json .
COPY package.json .

# Install dependencies
RUN npm config set strict-ssl false && npm ci

# Copy all application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy build files to Nginx's default public directory
COPY --from=build /app/build /var/www/front_build/html

COPY ./nginx/nginx.conf /etc/nginx

RUN mkdir /etc/nginx/keys/

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
