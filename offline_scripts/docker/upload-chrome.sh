sudo rm -r tmp-content/ && mkdir tmp-content
sudo docker build -f dockerfile.chrome -t ratatosk42/chrome tmp-content
sudo docker push ratatosk42/chrome:latest
