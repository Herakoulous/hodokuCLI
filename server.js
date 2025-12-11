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
  
  exec(`java -cp .:Hodoku.jar HoDoKuCLI "${req.params.puzzle}"`, (err, stdout, stderr) => {
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    console.log('error:', err);
    
    if (err) {
      return res.status(500).send(`Error: ${err.message}\nStderr: ${stderr}`);
    }
    
    const lines = stdout.trim().split('\n');
    res.send(lines[lines.length - 1]);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});