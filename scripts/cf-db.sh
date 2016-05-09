#! /usr/bin/env bash

# This script creates a psql binary for use when ssh-ing into cloud.gov
curl https://s3.amazonaws.com/18f-cf-cli/psql-9.4.4-ubuntu-14.04.tar.gz | tar xvz
./psql/bin/psql $DATABASE_URL
