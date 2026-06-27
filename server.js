const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.static(path.join(__dirname)));

// Express v5 compatible wildcard
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('EduForge live on port ' + PORT);
});