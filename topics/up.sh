#!/bin/bash

curl -d @q1.json -H "Content-Type:application/json" https://vote.metacity.jp/db/topic/raw/

curl -d @q2.json -H "Content-Type:application/json" https://vote.metacity.jp/db/topic/raw/

curl -d @q3.json -H "Content-Type:application/json" https://vote.metacity.jp/db/topic/raw/

curl -d @test_takenoko.json -H "Content-Type:application/json" https://vote.metacity.jp/db/topic/raw/

curl https://vote.metacity.jp/db/list/
