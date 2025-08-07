FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build the application
COPY . .
ARG REACT_APP_WS_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL
RUN npm run build

# Production image
FROM nginx:alpine
ARG REACT_APP_WS_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
