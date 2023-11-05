#!/usr/bin/env bash

# Send the close command
echo -e "\xA0\x01\x00\xA1" > /dev/ttyUSB0
sleep 1  # Adjust the delay as needed

# Query the gate state
echo -e "\xA0\x02\x00\xA2" > /dev/ttyUSB0
sleep 1  # Adjust the delay as needed

# Read the response from the USB relay to check the gate state
gate_state=$(cat /dev/ttyUSB0)

# If the gate is still closed, send the open command
if [[ "$gate_state" == "\xA0\x01\x00\xA1" ]]; then
    echo -e "\xA0\x01\x01\xA2" > /dev/ttyUSB0
fi
