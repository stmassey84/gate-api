const express = require("express");
const shell = require("shelljs");
const app = express();
const port = 8080;

const CYCLE_SCRIPT = "cycle.sh";

app.post("/cycle", (req, res) => {
  shell.exec(`./${CYCLE_SCRIPT}`);
  res.send("Cycled");
});

app.listen(port, () => {
  console.log(`Gate API listening on ${port}`);
});
