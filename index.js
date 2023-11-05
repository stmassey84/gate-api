const express = require("express");
const shell = require("shelljs");
const fs = require("fs");
const app = express();

const PORT = 8080;
const STATUS_FILE = "/var/www/gate_status.txt";
const CYCLE_SCRIPT = "cycle.sh";

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
      console.log("writing new status");
      if (err) {
        console.error(err);
        return reject({ message: "Failed to write to the status file" });
      }

      return resolve({ status: newStatus });
    });
  });
};

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/status", (req, res) => {
  getGateStatus()
    .then((status) => {
      res.status(200).json({ status });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

app.post("/cycle", (req, res) => {
  getGateStatus()
    .then((status) => {
      const newStatus = status ^ 1;
      console.log("newStatus", newStatus);
      shell.exec(`./${CYCLE_SCRIPT}`);
      updateGateStatus(newStatus)
        .then((result) => {
          console.log("success");
          res.status(200).json(result);
        })
        .catch((err) => {
          console.log("failure", err);
          res.status(500).json(err);
        });
    })
    .catch((err) => {
      res.status(500).json(err);
    });  
});

app.listen(PORT, () => {
  console.log(`Gate API listening on ${PORT}`);
});
