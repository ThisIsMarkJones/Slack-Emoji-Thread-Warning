const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const { hasReplied, markReplied } = require('./cache');

const app = express();
app.use(bodyParser.json());

const TARGET_EMOJI = process.env.TARGET_EMOJI || 'thread-warning';

app.post('/slack/events', async (req, res) => {
  const { type, event } = req.body;

  // Respond to Slack's challenge when verifying the Event Subscription
  if (type === 'url_verification') {
    return res.send({ challenge: req.body.challenge });
  }

  // Handle reaction events
  if (event && event.type === 'reaction_added') {
    if (event.reaction === TARGET_EMOJI) {
      const { channel, ts } = event.item;

      if (hasReplied(channel, ts)) {
        console.log(`Already replied to message ${channel}-${ts}`);
        return res.sendStatus(200);
      }

      try {
        await axios.post('https://slack.com/api/chat.postMessage', {
          channel,
          thread_ts: ts,
          text: "👀 This message probably belongs in a thread 🧵"
        }, {
          headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        markReplied(channel, ts);
        console.log(`Replied to ${channel}-${ts}`);
      } catch (err) {
        console.error('Error posting to Slack:', err.response?.data || err.message);
      }
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Slack bot is running on port ${PORT}`);
});
