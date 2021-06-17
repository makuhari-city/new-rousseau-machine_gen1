setup: 
	git submodule update -i
	make build

restart: 
	make stop
	make start

stop: 
	cd dump; docker-compose down; cd ../

start: 
	cd dump; docker-compose up -d; cd ../

build: 
	cd dump; docker-compose up;cd --
