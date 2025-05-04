import axios from "axios";

// You guys both wanted webhooks to let you know when the map data is updated, right? I now have that functional, but will need your hardcoded webhook urls. Can you share those with me? In the future I’ll allow them to be dynamic but for now was hoping to doing something light. It will just send a post or get (whichever you want) whenever the data changes. I will likely send a payload like this:
// {
// eventId?: number,
// locationId?: number,
// orgId?: number
// }
// where all 3 might be updated or undefined

interface Webhook {
  url: string;
  method: "POST" | "GET";
}

const webhooks: Webhook[] = [
  // {
  //   url: "https://58898a233cdb.ngrok.app/api/trpc/ping",
  //   method: "GET",
  // },
];

export const notifyWebhooks = async (data?: unknown) => {
  for (const webhook of webhooks) {
    if (webhook.method === "POST") {
      await axios.post(webhook.url, data, {
        method: webhook.method,
      });
    } else if (webhook.method === "GET") {
      await axios.get(webhook.url, {
        method: webhook.method,
      });
    }
  }
};
