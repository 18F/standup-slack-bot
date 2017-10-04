#!/usr/bin/env bash
./wait-for-it.sh -s -q -t 0 database:5432 -- npm start
