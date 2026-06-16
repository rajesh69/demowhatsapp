const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "my_verify_token";

/**
 * Webhook Verification
 * Meta sends a GET request when you configure the webhook.
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/**
 * Receive WhatsApp Events
 */
app.post("/webhook", (req, res) => {
  const body = req.body;

  console.log(
    "Incoming webhook:",
    JSON.stringify(body, null, 2)
  );

  // Handle incoming WhatsApp messages
  if (body.object === "whatsapp_business_account") {
    body.entry?.forEach((entry) => {
      entry.changes?.forEach((change) => {
        if (change.field === "messages") {
          console.log("Message event:", change.value);
        }
      });
    });
  }

  // Meta expects 200 OK
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Webhook running on port ${PORT}`);
});