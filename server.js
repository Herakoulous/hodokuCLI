const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();

app.get('/test-java', (req, res) => {
  exec('java -version', (err, stdout, stderr) => {
    res.send(`Java version:\n${stderr}\n${stdout}`);
  });
});

app.get('/', (req, res) => {
  const files = fs.readdirSync('.');
  res.send(`Server is running. Files: ${files.join(', ')}`);
});

app.get('/hint/:puzzle/:step?', (req, res) => {
  const puzzle = req.params.puzzle;
  const step = req.params.step || '1';
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${puzzle}" ${step}`;
  
  exec(cmd, { timeout: 4000 }, (err, stdout, stderr) => {
    if (stdout && stdout.trim()) {
      const lines = stdout.trim().split('\n');
      const hint = lines[lines.length - 1];
      return res.send(hint);
    }
    
    res.status(500).send(`No output\nStderr: ${stderr}`);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});