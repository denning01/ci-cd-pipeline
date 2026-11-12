FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY index.js cities.js ./
COPY public ./public
USER node
EXPOSE 8080
CMD ["node", "index.js"]
