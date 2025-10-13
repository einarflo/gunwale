# Simple static site container for Betaworks landing page
FROM nginx:alpine

# Copy static assets
WORKDIR /usr/share/nginx/html
COPY index.html ./
COPY styles.css ./
COPY app.js ./

# Optional: basic healthcheck via default nginx welcome (root path)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ >/dev/null || exit 1

# Nginx listens on 80 by default
EXPOSE 80

