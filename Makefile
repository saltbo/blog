build:
	hugo
	mkdir -p functions 
	go get -v ./...
	go build -v -o functions/hello ./...
