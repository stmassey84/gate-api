const express = require("express");
const shell = require("shelljs");
const app = express();

const PORT = 8080;
const STATUS_SCRIPT = "read_gate_status.sh";
const OPEN_SCRIPT = "open_gate.sh";
const CLOSE_SCRIPT = "close_gate.sh";

const getGateStatus = () => {
  const result = shell.exec(`./${STATUS_SCRIPT}`);

  if (result.code === 0) {
    return result.stdout.trim();
  } else {
    throw new Error(result.stderr);
  }
};

const openGate = () => {
  const result = shell.exec(`./${OPEN_SCRIPT}`);

  if (result.code === 0) {
    return result.stdout.trim();
  } else {
    throw new Error(result.stderr);
  }
}

const closeGate = () => {
  const result = shell.exec(`./${CLOSE_SCRIPT}`);

  if (result.code === 0) {
    return result.stdout.trim();
  } else {
    throw new Error(result.stderr);
  }
}

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/status", (req, res) => {
  try {
    const status = getGateStatus();
    res.status(200).json({ status });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/cycle", (req, res) => {
  let status;

  try {
    status = getGateStatus();
    res.status(200).json({ status });
  } catch (err) {
    return res.status(500).json({ message: "There was a problem getting the gate's status", err });
  }

  if (status === "OPEN") {
    // close
    try {
      closeGate();
    } catch (err) {
      res.status(500).json({ message: "There was a problem trying to close the gate", err });
    }
  } else if (status === "CLOSED") {
    // open
    try {
      openGate();
    } catch (err) {
      res.status(500).json({ message: "There was a problem trying to open the gate", err });
    }    
  } else {
    // unknown
    res.status(500).json({ message: "Unknown gate status", status });
  } 
});

app.listen(PORT, () => {
  console.log(`Gate API listening on ${PORT}`);
});
