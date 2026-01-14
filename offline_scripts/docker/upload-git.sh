sudo rm -r tmp-content/ && mkdir tmp-content
sudo docker build -f dockerfile.git -t ratatosk42/git tmp-content
sudo docker push ratatosk42/git:latest
