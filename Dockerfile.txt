FROM node:18

# Install Java
RUN apt-get update && apt-get install -y openjdk-17-jdk

WORKDIR /app

# Copy files
COPY package*.json ./
COPY HoDoKuCLI.java ./
COPY Hodoku.jar ./
COPY server.js ./

# Install npm packages and compile Java
RUN npm install
RUN javac -cp Hodoku.jar HoDoKuCLI.java

EXPOSE 10000

CMD ["npm", "start"]