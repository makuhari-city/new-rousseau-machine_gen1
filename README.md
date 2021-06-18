# rousseau-machine

## To get started
```
git clone https://github.com/makuhari-city/rousseau-machine.git --recursive
```
if you forgot to add "--recursive" option while cloning repositoy, just 'make setup' after cloning.

## To start system
```
make start
```

## To stop system
```
make stop
```

## Test system
### For dump module
```
curl -v http://localhost:8082/db/hello/
```

### For vote module
```
cd vote
curl -H "Content-Type:application/json" -d @dinner.json http://localhost:8081/rpc/
```
