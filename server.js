const express = require('express');
const { exec } = require('child_process');
const app = express();

app.get('/', (req, res) => {
  const fs = require('fs');
  const files = fs.readdirSync('.');
  res.send(`Server is running. Files: ${files.join(', ')}`);
});

app.get('/warmup', (req, res) => {
  console.log('Warmup request - running Java');
  const testPuzzle = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${testPuzzle}" 1`;
  
  exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
    console.log('Warmup complete');
    res.send('Server warm and ready');
  });
});

app.get('/test-java', (req, res) => {
  exec('java -version', (err, stdout, stderr) => {
    res.send(`Java version:\n${stderr}\n${stdout}`);
  });
});

app.get('/hint/:puzzle/:step?', (req, res) => {
  const puzzle = req.params.puzzle;
  const step = req.params.step || '1';
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${puzzle}" ${step}`;
  
  console.log('Starting Java process');
  let responded = false;
  
  const child = exec(cmd, { timeout: 30000 });
  let stdout = '';
  let stderr = '';
  
  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  
  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });
  
  // Check every 500ms if we have output
  const checkInterval = setInterval(() => {
    if (responded) {
      clearInterval(checkInterval);
      return;
    }
    
    if (stdout.trim()) {
      responded = true;
      clearInterval(checkInterval);
      child.kill(); // Stop Java if still running
      
      const lines = stdout.trim().split('\n');
      const hint = lines[lines.length - 1];
      console.log('Got output, sending:', hint);
      res.send(hint);
    }
  }, 500);
  
  child.on('close', (code) => {
    clearInterval(checkInterval);
    if (responded) return;
    responded = true;
    
    console.log('Process ended, code:', code);
    if (stdout.trim()) {
      const lines = stdout.trim().split('\n');
      return res.send(lines[lines.length - 1]);
    }
    
    res.status(500).send('No output');
  });
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});