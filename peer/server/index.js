// Import the Express module
const express = require('express');
const cors = require('cors');

const PORT = 5000;
const timeToLive = 1
// Create an Express application
const app = express();
let lastActivityTime = Date.now();
const inactivityTimeout = timeToLive * 60 * 1000;

function checkInactivity() {
  const currentTime = Date.now();
  console.log(`Time since last message: ${(currentTime - lastActivityTime)/ 1000} seconds`)
  if (currentTime - lastActivityTime >= inactivityTimeout) {
    console.log(`No activity for ${timeToLive} minutes. Terminating child process...`);
    process.exit();  // Terminate the child process
  }
}

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, World! Welcome to the Express server!');
  lastActivityTime  = Date.now()
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Start the heartbeat, dies after X mins
setInterval(checkInactivity, timeToLive * 10000);