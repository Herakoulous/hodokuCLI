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
  console.log('Received request for puzzle:', req.params.puzzle);
  
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${req.params.puzzle}"`;
  
  exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
    // Java INFO logs go to stderr, ignore them
    if (err && !stdout) {
      return res.status(500).send(`Error: ${err.message}\n\nStderr:\n${stderr}`);
    }
    
    const lines = stdout.trim().split('\n');
    const hint = lines[lines.length - 1] || 'No hint available';
    res.send(hint);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});