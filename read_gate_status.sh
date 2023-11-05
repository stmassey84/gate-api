#!/bin/bash

# Send the query command to /dev/ttyUSB0
echo -e "\xA0\x01\x00\xA1" > /dev/ttyUSB0

# Set a timeout of 5 seconds for reading the response
if timeout 5 cat /dev/ttyUSB0 > /tmp/gate_status; then
    # Read the response from the temporary file and store it in a variable
    gate_status=$(cat /tmp/gate_status)
    rm /tmp/gate_status
else
    echo "Timeout: Unable to read gate status within 5 seconds."
    exit 1
fi

# Check the gate status and print the result
if [[ "$gate_status" == $'\xA0\x01\x00\xA1' ]]; then
    echo "CLOSED"
elif [[ "$gate_status" == $'\xA0\x01\x01\xA2' ]]; then
    echo "OPEN"
else
    echo "UNKNOWN: $gate_status"
fi
