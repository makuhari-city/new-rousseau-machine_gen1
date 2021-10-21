# New Rousseau Machine (Gen1)

## To get started
1. Download the repository
```
git clone https://github.com/makuhari-city/rousseau-machine.git --recursive
```
if you forgot to add "--recursive" option while cloning repositoy, just 'make setup' after cloning.

2. Locate SSL certificate.
Create an SSL certificate, rewrite the destination directory path into docker-compose.yml, and uncomment and rewrite the file name into proxy/conf.d/default.conf.

docker-compose.yml:
```
volumes:
	- ./ssl/cert:/etc/nginx/ssl
```

proxy/conf.d/default.conf:
```
listen 443 ssl;
ssl_certificate		/etc/nginx/ssl/metacity.jp.crt;
ssl_certificate_key	/etc/nginx/ssl/metacity.jp.key;
```



## To update system
```
make update
```

## To start system
```
make start
```

## To stop system
```
make stop
```

## To test system (connection test only)
```
make test
```
- For dump, it returns "Hello"
- For vote, it returns {"jsonrpc":"2.0","id":1,"result":{"beef":8.0,"chicken":8.0,"pork":8.0}}
- For ipfs, it returns "Hello, ipfs api."


