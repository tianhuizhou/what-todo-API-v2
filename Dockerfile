FROM node

RUN mkdir -p /home/app
WORKDIR /home/app

COPY package*.json ./
COPY . .

RUN npm install --production

EXPOSE 3000

CMD ["npm", "run", "serve:prod"]
