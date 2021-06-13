FROM golang:1.15.13-alpine3.13
RUN apk add --update && apk add git && apk add curl
RUN mkdir /go/src/app
WORKDIR /go/src/app
ADD . /go/src/app

# Install dependencies
RUN go get -u github.com/ipfs/go-ipfs-api
