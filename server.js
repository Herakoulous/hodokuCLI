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
  
  exec(cmd, { timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    // Process completed (success or failure)
    if (err && err.killed) {
      // Only error if actually killed by timeout
      return res.status(500).send(`Timeout: Process took too long`);
    }
    
    if (stdout && stdout.trim()) {
      // Got output - extract hint
      const lines = stdout.trim().split('\n');
      const hint = lines[lines.length - 1];
      return res.send(hint);
    }
    
    // No output
    res.status(500).send(`No hint generated\nStderr: ${stderr}`);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});