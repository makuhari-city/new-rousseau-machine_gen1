# the-mouth-of-truth

## To setup system
Create an SSL certificate, rewrite the destination directory path into docker-compose.yml, and uncomment and rewrite the file name into conf.d/default.conf.

docker-compose.yml:
```
volumes:
	- ./ssl/cert:/etc/nginx/ssl
```

conf.d/default.conf:
```
listen 443 ssl;
ssl_certificate		/etc/nginx/ssl/metacity.jp.crt;
ssl_certificate_key	/etc/nginx/ssl/metacity.jp.key;
```


## To setup the forwarding destination
Just add 'location' directive as follows.

conf.d/default.conf:
```
location /db/ {
	proxy_pass      http://dump_app_1:8082/db/;
}

location /rpc/ {
	proxy_pass      http://vote_app_1:8081/rpc/;
}
```


## To start system
```
docker-compose up -d
```


## To stop system
```
docker-compose down
```
