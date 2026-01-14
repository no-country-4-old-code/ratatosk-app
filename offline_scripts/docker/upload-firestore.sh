sudo rm -r tmp-content/ && mkdir tmp-content
sudo cp ../../backend/firestore/package.json ./tmp-content/
sudo docker build -f dockerfile.firestore -t ratatosk42/fire tmp-content
sudo docker push ratatosk42/fire:latest
sudo rm -r tmp-content/ && mkdir tmp-content
