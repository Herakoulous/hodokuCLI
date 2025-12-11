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

app.get('/hint/:puzzle', (req, res) => {
  const puzzle = req.params.puzzle;
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${puzzle}"`;
  
  exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
    console.log('Stdout:', stdout);
    console.log('Stderr:', stderr);
    
    // If we have stdout, ignore the error (it's just config file write failure)
    if (stdout && stdout.trim()) {
      const lines = stdout.trim().split('\n');
      const hint = lines[lines.length - 1];
      console.log('Sending hint:', hint);
      return res.send(hint);
    }
    
    // Only error if no output
    res.status(500).send(`No output\nStderr: ${stderr}`);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});