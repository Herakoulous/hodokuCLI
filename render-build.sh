#!/bin/bash
apt-get update
apt-get install -y openjdk-17-jdk
npm install
javac -cp Hodoku.jar HoDoKuCLI.java