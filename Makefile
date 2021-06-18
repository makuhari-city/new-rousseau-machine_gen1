.PHONY:setup stop start
setup:
	git submodule update -i

restart: stop start

stop: 
	cd dump; docker-compose down; 
	cd vote; docker-compose down;

start: 
	cd dump; docker-compose up -d; 
	cd vote; docker-compose up -d; 

