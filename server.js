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
  console.log('=== START REQUEST ===');
  console.log('Puzzle:', puzzle);
  console.log('Time:', new Date().toISOString());
  
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${puzzle}"`;
  console.log('Command:', cmd);
  
  const child = exec(cmd, { timeout: 15000 }, (err, stdout, stderr) => {
    console.log('=== CALLBACK FIRED ===');
    console.log('Error:', err);
    console.log('Stdout length:', stdout?.length);
    console.log('Stderr length:', stderr?.length);
    console.log('Stdout:', stdout);
    console.log('Stderr:', stderr);
    
    const response = `Error: ${err?.message || 'none'}\n\nStdout:\n${stdout}\n\nStderr:\n${stderr}`;
    console.log('=== SENDING RESPONSE ===');
    console.log(response);
    
    res.send(response);
  });
  
  child.on('exit', (code) => {
    console.log('Process exited with code:', code);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});