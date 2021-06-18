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

test:
	curl -v http://localhost:8082/db/hello/;echo "\n"
	cd vote;curl -H "Content-Type:application/json" -d @dinner.json http://localhost:8081/rpc/
