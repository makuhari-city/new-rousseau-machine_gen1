.PHONY:setup stop start
setup:
	git submodule update -i

restart: stop start

stop:
	cd dump; docker-compose down;
	cd vote; docker-compose down;
	cd proxy; docker-compose down;
	docker network rm makuhari_city;

start:
	docker network create makuhari_city;
	cd dump; docker-compose up -d;
	cd vote; docker-compose up -d;
	cd proxy; docker-compose up -d;

test:
	curl -v http://localhost/db/hello/;echo "\n"
	cd vote;curl -H "Content-Type:application/json" -d @dinner.json http://localhost/rpc/
