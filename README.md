# rousseau-machine

## To get started
```
git clone https://github.com/makuhari-city/rousseau-machine.git --recursive
```
if you forgot to add "--recursive" option while cloning repositoy, just 'make setup' after cloning.

## To update system.
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

## To test system
```
make test
```
if it returns "Hello" and json file like this "{"jsonrpc":"2.0","id":1,"result":{"beef":8.0,"chicken":8.0,"pork":8.0}}", it works.
