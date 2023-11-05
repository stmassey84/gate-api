#!/bin/bash

# Send the open gate command to /dev/ttyUSB0
echo -e "\xA0\x01\x01\xA2" > /dev/ttyUSB0

# Wait briefly to allow the gate to open
sleep 1

echo "Gate is now open."