FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the Next.js production bundle
# We pass an env variable NEXT_PUBLIC_API_URL so it compiles it into the static pages correctly if needed.
# Since in Docker Compose, the user client (browser) is accessing localhost:5000 directly,
# we set NEXT_PUBLIC_API_URL to http://localhost:5000.
ENV NEXT_PUBLIC_API_URL=http://localhost:5000
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
