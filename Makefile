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
	curl -d '["fptp", "http://ftpt:8101"]' -H "Content-Type:application/json" http://localhost/module/;
	curl -d '["liquid", "http://liquid:8102"]' -H "Content-Type:application/json" http://localhost/module/;
	curl -d '["borda", "http://borda:8103"]' -H "Content-Type:application/json" http://localhost/module/;

test:
	cd vote;curl -v -H "Content-Type:application/json" -d @sample.json http://localhost/rpc/;echo "\n";
	curl -v http://localhost/hello-ipfs/;
