// Import the Express module
const express = require('express');
const cors = require('cors');

// Create an Express application
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, World! Welcome to the Express server!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});