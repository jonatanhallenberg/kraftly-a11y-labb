# Steg 1: bygg appen med Node
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Steg 2: servera de statiska filerna med nginx – bara det här blir imagen
FROM nginx:1.27-alpine
# Mall, inte färdig config: PORT, API_URL och API_KEY kommer från miljön vid start.
# Imagen innehåller ingen adress och ingen nyckel – samma image i compose, staging och prod.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Vilken commit är det här? Pipelinen skickar in sha:n – läses på /version.txt
ARG GIT_SHA=lokal
RUN echo "$GIT_SHA" > /usr/share/nginx/html/version.txt
# Render sätter PORT själv. Lokalt och i compose gäller 80.
ENV PORT=80
EXPOSE 80
