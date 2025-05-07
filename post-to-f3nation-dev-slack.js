const https = require("https");
const url = require("url");

exports.pubsubToSlack = (event, context) => {
  try {
    // Get attributes from the Pub/Sub message
    const attributes = event.attributes || {};
    const environment = attributes.environment || "unknown";
    const service = attributes.service || "unknown";
    const buildType = attributes["build-type"] || "unknown";

    // Get the message data
    const pubsubMessage = event.data
      ? Buffer.from(event.data, "base64").toString()
      : "No message received";

    // Parse the message (assuming it's JSON)
    let messageData;
    try {
      messageData = JSON.parse(pubsubMessage);
    } catch (e) {
      messageData = { text: pubsubMessage };
    }

    // Customize message based on environment
    let slackChannel, slackMessage;
    if (environment === "production") {
      slackChannel = process.env.PROD_SLACK_WEBHOOK_URL;
      slackMessage = {
        text: "🚀 *PRODUCTION* Build Success!",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🚀 *PRODUCTION DEPLOYMENT SUCCESSFUL*\nService: ${service}\nType: ${buildType}`,
            },
          },
        ],
      };
    } else {
      slackChannel = process.env.STAGING_SLACK_WEBHOOK_URL;
      slackMessage = {
        text: "🧪 *STAGING* Build Success!",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🧪 *STAGING DEPLOYMENT SUCCESSFUL*\nService: ${service}\nType: ${buildType}`,
            },
          },
        ],
      };
    }

    // Send to appropriate Slack channel
    sendToSlack(slackMessage, slackChannel);
  } catch (error) {
    console.error("Error processing message:", error);
  }
};

function sendToSlack(message, webhookUrl) {
  const parsedUrl = url.parse(webhookUrl);

  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    console.log(`Slack API responded with status code: ${res.statusCode}`);
  });

  req.on("error", (e) => {
    console.error(`Error sending to Slack: ${e.message}`);
  });

  req.write(JSON.stringify(message));
  req.end();
}
