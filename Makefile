.PHONY:setup stop start
setup:
	git submodule update -i

update:
	git pull
	git submodule update --remote

restart: stop start

stop:
	cd vote; docker-compose down;
	cd dump; docker-compose down;
	docker-compose down;
	docker network rm makuhari_city;

start:
	docker network create makuhari_city;
	docker-compose up -d;
	cd dump; docker-compose up -d;
	cd vote; docker-compose up -d;

test:
	curl -v http://localhost/db/hello/;echo "\n";
	cd vote;curl -v -H "Content-Type:application/json" -d @dinner.json http://localhost/rpc/;echo "\n";
	curl -v http://localhost/ipfs/;curl -v -d "test" http://localhost/ipfs/;
