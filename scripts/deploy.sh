#! /usr/bin/env bash

set -e

API="https://api.cloud.gov"
ORG="18F-ACQ"
TYPE=$1

if [ $# -ne 1 ]; then
  echo "Usage: deploy <TYPE>"
  exit
fi

# Check that autopilot is installed (should be done in .travis.yml before_deploy)
if cf plugins | grep -q "autopilot"; then
  :
else
  echo "Install autopilot to use zero-downtime deploys. For installation instructions, see:"
  echo "https://github.com/concourse/autopilot#installation"
fi

# Gather information from manifest
if [[ $TYPE = "production" ]]; then
  MANIFEST="manifest.yml"
else
  MANIFEST="manifest-${TYPE}.yml"
fi
echo "Using ${MANIFEST} for deploy"

if [[ -e $MANIFEST ]]; then
  NAME=$(cat $MANIFEST | grep name | cut -d':' -f2 | tr -d ' ')
elif git status | grep -q "On"; then
  while git status | grep -q "On"; do
    cd ..
    if [[ -e $MANIFEST ]]; then
      NAME=$(cat $MANIFEST | grep name | cut -d':' -f2 | tr -d ' ')
      break
    fi
  done
else
  echo -e "Error: can't locate ${MANIFEST}"
  exit 1
fi

cf login -a $API -u $CF_USERNAME -p $CF_PASSWORD -o $ORG -s tools
cf zero-downtime-push $NAME -f $MANIFEST
