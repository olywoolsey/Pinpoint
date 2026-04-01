# Use an official Node image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of your application code
COPY . .

# Expose port 3000 for the development server
EXPOSE 3000

# Start the development server using Yarn
CMD ["yarn", "start"]

# Production stage
# Uncomment the following lines for a production build
# FROM node:latest as build
# WORKDIR /app
# COPY package.json yarn.lock ./
# RUN yarn install
# COPY . .
# RUN yarn build
# FROM nginx:alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]