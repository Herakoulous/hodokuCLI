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

app.get('/warmup', (req, res) => {
  console.log('Warmup request - running Java');
  
  // Run a quick Java command to warm up JVM + HoDoKu
  const testPuzzle = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${testPuzzle}" 1`;
  
  exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
    console.log('Warmup complete');
    res.send('Server warm and ready');
  });
});

app.get('/hint/:puzzle/:step?', (req, res) => {
  const puzzle = req.params.puzzle;
  const step = req.params.step || '1';
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${puzzle}" ${step}`;
  
  exec(cmd, (err, stdout, stderr) => {
    // Log everything
    console.log('Process completed');
    console.log('Stdout:', stdout);
    console.log('Stderr:', stderr);
    console.log('Error:', err);
    
    // Send response immediately when callback fires
    if (stdout && stdout.trim()) {
      const lines = stdout.trim().split('\n');
      const hint = lines[lines.length - 1];
      return res.send(hint);
    }
    
    // If no stdout, send the actual error details
    res.status(500).send(`No output\nStderr: ${stderr}\nError: ${err?.message || 'none'}`);
  });
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});