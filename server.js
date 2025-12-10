const express = require('express');
const { exec } = require('child_process');
const app = express();

app.get('/hint/:puzzle', (req, res) => {
  exec(`java -cp .;HoDoKu.jar HoDoKuCLI "${req.params.puzzle}"`, (err, stdout) => {
    const lines = stdout.trim().split('\n');
    res.send(lines[lines.length - 1]);
  });
});

app.listen(process.env.PORT || 8080);