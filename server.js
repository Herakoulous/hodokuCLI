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
  
  console.log('========== HINT REQUEST ==========');
  console.log('Puzzle:', puzzle);
  console.log('Step:', step);
  
  const cmd = `java -cp .:Hodoku.jar HoDoKuCLI "${puzzle}" ${step}`;
  
  exec(cmd, (err, stdout, stderr) => {
    console.log('Java completed');
    console.log('Stdout:', stdout);
    
    if (stdout && stdout.trim()) {
      const lines = stdout.trim().split('\n');
      const hint = lines[lines.length - 1];
      console.log('Sending:', hint);
      return res.send(hint);
    }
    
    res.status(500).send(`No output\nStderr: ${stderr}`);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});