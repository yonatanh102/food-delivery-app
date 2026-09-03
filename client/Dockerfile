# Stage 1: Build the React application
FROM node:22-alpine AS build
WORKDIR /app

# copying package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN npm install

# copying the rest of the code and building the project
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# exposing port 80 and running the server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]