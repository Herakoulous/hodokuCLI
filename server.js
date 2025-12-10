const express = require('express');
const { exec } = require('child_process');
const app = express();

app.get('/hint/:puzzle', (req, res) => {
exec(`java -cp .:Hodoku.jar HoDoKuCLI "${req.params.puzzle}"`, (err, stdout) => {
    const lines = stdout.trim().split('\n');
    res.send(lines[lines.length - 1]);
  });
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});