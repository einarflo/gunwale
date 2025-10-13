FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# Install with devDependencies so Prisma CLI is available at runtime/build
RUN npm install

# Copy Prisma schema so prisma generate can run (prestart) and clients can be generated
COPY prisma ./prisma

COPY tsconfig.json ./
COPY src ./src
# Generate Prisma client after sources are in place
RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 1337

CMD ["npm", "run", "start"]
