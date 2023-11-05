#!/bin/bash

# Send the close gate command to /dev/ttyUSB0
echo -e "\xA0\x01\x00\xA1" > /dev/ttyUSB0

# Wait briefly to allow the gate to close
sleep 1

echo "Gate is now closed."
