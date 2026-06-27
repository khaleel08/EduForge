const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('EduForge live on port ' + PORT);
});