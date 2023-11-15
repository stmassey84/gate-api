const express = require("express");
const shell = require("shelljs");
const fs = require("fs");
const app = express();

app.use(express.json());

const PORT = 8080;
const CYCLE_SCRIPT = "cycle.sh";
const STATUS_FILE = "/var/www/gate_status.txt";

const cycleGate = () => {
  const result = shell.exec(`./${CYCLE_SCRIPT} &`);

  if (result.code !== 0) {
    throw new Error(result.stderr);
  }

  return result.stdout.trim();
}

const getGateStatus = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(STATUS_FILE, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return reject({ message: "Failed to read the status file" });
      }

      const value = parseInt(data, 10);

      if (isNaN(value) || (value !== 0 && value !== 1)) {
        return reject({ message: "Invalid value found in the status file" });
      }

      return resolve(value);
    });
  });
};

const updateGateStatus = (newStatus) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(STATUS_FILE, newStatus.toString(), (err) => {
      console.log("writing new status", newStatus);
      if (err) {
        console.error(err);
        return reject({ message: "Failed to write to the status file" });
      }

      return resolve({ status: newStatus });
    });
  });
};

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/status", async (req, res) => {
  try {
    const status = await getGateStatus();
    res.status(200).json({ status });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/status", async (req, res) => {
  const status = req.body.status;
  console.log(`Forcing status to ${status}`);
  if (status !== 0 && status !== 1) {
    return res.status(500).json({ message: "Invalid status", status });
  }

  await updateGateStatus(status);

  res.status(200).json({ message: "Successfully updated status", status });
});

app.post("/cycle", async (req, res) => {
  let status;

  try {
    status = await getGateStatus();
    console.log(`Current Gate status: ${status}`);
  } catch (err) {
    return res.status(500).json({ message: "There was a problem getting the gate's status", err });
  }

  const newStatus = status ^ 1;

  console.log(`New Gate status: ${newStatus}`);

  try {
    cycleGate();
  } catch (err) {
    return res.status(500).json({ message: "There was a problem cycling the gate", err });
  }

  try {
    updateGateStatus(newStatus);
    return res.status(200).json({ status: newStatus });
  } catch (err) {
    return res.status(500).json({ message: "There was a problem updating the gate's status", err });
  }
});

app.listen(PORT, () => {
  console.log(`Gate API listening on ${PORT}`);
});
