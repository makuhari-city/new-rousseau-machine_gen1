.PHONY:setup stop start
setup:
	git submodule update -i

update:
	git pull
	git submodule update --remote

restart: stop start

build:
	docker-compose build;
	cd dump; docker-compose build;
	cd vote; docker-compose build;
	cd em-fptp; docker-compose build;
	cd em-liquid; docker-compose build;
	cd em-borda; docker-compose build;
	cd frontend; docker-compose build; 

stop:
	cd frontend; docker-compose build;
	cd em-borda; docker-compose down;
	cd em-liquid; docker-compose down;
	cd em-fptp; docker-compose down;
	cd vote; docker-compose down;
	cd dump; docker-compose down;
	# cd citizen; docker-compose down;
	docker-compose down;
	docker network rm makuhari_city;

start:
	docker network create makuhari_city;
	docker-compose up -d;
	# cd citizen; docker-compose up -d;
	cd dump; docker-compose up -d;
	cd vote; docker-compose up -d;
	cd em-fptp; docker-compose up -d;
	cd em-liquid; docker-compose up -d;
	cd em-borda; docker-compose up -d;
	curl -d '["fptp", "https://vote.metacity.jp"]' -H "Content-Type:application/json" https://vote.metacity.jp/rpc/module/;
	curl -d '["liquid", "https://vote.metacity.jp"]' -H "Content-Type:application/json" https://vote.metacity.jp/rpc/module/;
	curl -d '["borda", "https://vote.metacity.jp"]' -H "Content-Type:application/json" https://vote.metacity.jp/rpc/module/;
	cd frontend; docker-compose up -d;

test:
	curl -v http://localhost/fptp/hello/;
	curl -v http://localhost/liquid/hello/;
	curl -v http://localhost/borda/hello/;
	curl -v http://localhost/rpc/hello/;
	curl -v http://localhost/ipfs/;curl -v -d '{"data":"hello world"}' -X POST -H "Content-Type:application/json" http://localhost/ipfs/;
