#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./free-port.sh <port>"
  exit 1
fi

PORT=$1
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "Port $PORT is free."
  exit 0
fi

echo "Port $PORT is used by process $PID:"
ps -p $PID -o pid,user,command --no-headers
echo ""
read -p "Kill this process? (y/n) " ANSWER

if [ "$ANSWER" = "y" ]; then
  kill $PID
  echo "Process $PID killed. Port $PORT is now free."
else
  echo "Process kept alive."
fi
