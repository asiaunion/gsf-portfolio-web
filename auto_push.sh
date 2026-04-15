#!/bin/bash
while true; do
  git push -u origin main 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "Successfully pushed to GitHub!"
    break
  fi
  sleep 5
done
