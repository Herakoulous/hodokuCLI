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

const { spawn } = require('child_process');

app.get('/hint/:puzzle/:step?', (req, res) => {
  const puzzle = req.params.puzzle;
  const step = req.params.step || '1';
  
  console.log('========== NEW HINT REQUEST ==========');
  console.log('Puzzle:', puzzle);
  console.log('Step:', step);
  
  const startTime = Date.now();
  let responded = false;
  
  // Use shell: true to find java in PATH
  const child = spawn('java', ['-cp', '.:Hodoku.jar', 'HoDoKuCLI', puzzle, step], {
    shell: true
  });
  
  let stdout = '';
  let stderr = '';
  
  child.stdout.on('data', (data) => {
    stdout += data.toString();
    console.log('📤 Stdout chunk received');
  });
  
  child.stderr.on('data', (data) => {
    stderr += data.toString();
    console.log('📤 Stderr chunk received');
  });
  
 child.on('close', (code) => {
  if (responded) return;
  responded = true;
  
  const elapsed = Date.now() - startTime;
  console.log('========== PROCESS COMPLETED ==========');
  console.log('Exit code:', code);
  console.log('Elapsed time:', elapsed + 'ms');
  console.log('Full stdout:', stdout);
  console.log('Full stderr:', stderr);  // Add this
  
  if (stdout.trim()) {
    const lines = stdout.trim().split('\n');
    const hint = lines[lines.length - 1];
    console.log('✅ SENDING HINT:', hint);
    return res.send(hint);
  }
  
  console.log('❌ NO OUTPUT');
  res.status(500).send(`Exit code ${code}\nStderr: ${stderr}`);
});
  
  child.on('error', (err) => {
    if (responded) return;
    responded = true;
    console.log('❌ SPAWN ERROR:', err.message);
    res.status(500).send(`Spawn error: ${err.message}`);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});