const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')

const PORT = process.argv[2] || 3000;
const timeToLive = 20
const app = express();
const jsonParser = bodyParser.json()

let lastActivityTime = Date.now();
const inactivityTimeout = timeToLive * 60 * 1000;

function checkInactivity() {
  const currentTime = Date.now();
  console.log(`Time since last message: ${(currentTime - lastActivityTime)/ 1000} seconds`)
  if (currentTime - lastActivityTime >= inactivityTimeout) {
    console.log(`No activity for ${timeToLive} minutes. Terminating child process...`);
    process.exit();
  }
}

app.use(cors());

app.post('/',jsonParser, (req, res) => {
  // Message has been recieved send it to electron app
  console.log(req.body)
  res.send('Message received successfully');
  lastActivityTime = Date.now()
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Start the heartbeat, dies after X mins
setInterval(checkInactivity, timeToLive * 10000);