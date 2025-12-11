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
  
  exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    console.log('Process completed');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    
    // Java logs to stderr but that's OK - check stdout for actual hint
    if (stdout && stdout.trim()) {
      const lines = stdout.trim().split('\n');
      const hint = lines[lines.length - 1];
      return res.send(hint);
    }
    
    // If no stdout, something went wrong
    res.status(500).send(`No output received\nStderr: ${stderr}\nError: ${err?.message || 'none'}`);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});