FROM golang:1.15.13-alpine3.13
RUN apk add --update && apk add git
RUN mkdir /go/src/app
WORKDIR /go/src/app
ADD . /go/src/app

