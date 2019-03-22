build:
	hugo
	mkdir -p functions 
	cd server && go build -v -o ../functions/test ./...
