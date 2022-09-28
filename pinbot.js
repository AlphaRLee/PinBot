const path = require("path");
const fs = require("fs");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [Partials.Channel],
});
const credentials = require("./auth.json");
const config = require("./config.json");

const pinChannelName = config.pinChannelName;
const pinEmojiIdentifier = config.pinEmojiIdentifier;
const pinLimit = config.pinLimit;

// Read from ./events folder
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// client.on("messageReactionAdd", (messageReaction) => {
//   if (messageReaction.emoji.identifier !== pinEmojiIdentifier) {
//     return;
//   }

//   pinMessageToFullChannel(messageReaction.message);
// });

// client.on("channelPinsUpdate", (channel, time) => {
//   channel
//     .fetchMessages({ limit: 1 })
//     .then((messages) => {
//       const lastMessage = messages.first(); // Get the only message in this history
//       if (!lastMessage.system) {
//         console.log(
//           "ERROR: Expected last message to be from the system, instead it is:\n" +
//             "\tauthor:\t" +
//             lastMessage.author +
//             "\n" +
//             "\tcontent:\t" +
//             lastMessage.content
//         );
//         return;
//       }

//       // TODO Read last message content and determine whether or not was done by pinbot
//       // Kludge method assumes anything with "PinBot" inside it must be by PinBot
//       if (lastMessage.content.includes("PinBot")) {
//         return;
//       }
//     })
//     .catch((error) => failureCallBack(error));

//   archiveLastPinsFromFullChannel(channel, 49);
// });

function sendMessage(channel, messageContent) {
  channel.send(messageContent).catch(failureCallBack);
}

function failureCallBack(error) {
  console.log("The following error was caught: " + error);
  console.log("Error.toString: " + error.toString());
  console.log("Error name: " + error.name);
  console.log("Error message: " + error.message);
  console.log("Error stack: " + error.stack);
  console.log("Discord Error code: " + error.code);
  console.log("Discord Error method: " + error.method);
  console.log("Discord Error path: " + error.path);
}

function pinMessageToFullChannel(message) {
  var channel = message.channel;
  var pinChannel = message.guild.channels.find(
    (channel) => channel.name.toLowerCase() === pinChannelName.toLowerCase()
  );

  archiveLastPinsFromFullChannel(channel, pinLimit - 1)
    .then((result) => {
      return message.pin();
    })
    .catch((error) => failureCallBack(error));
}

function archiveLastPinFromFullChannel(channel) {
  archiveLastPinsFromFullChannel(channel, pinLimit);
}

/**
 * Archive the last pins from the channel until the number of desiredPinCount pins remain
 * Does nothing if there are already lesser than or an equal number of pins in the channel
 */
function archiveLastPinsFromFullChannel(channel, desiredPinCount) {
  if (desiredPinCount >= pinLimit) {
    return Promise.resolve(true);
  }

  var pinChannel = channel.guild.channels.find(
    (guildChannel) => guildChannel.name.toLowerCase() === pinChannelName.toLowerCase()
  );

  return channel
    .fetchPinnedMessages()
    .then((pinnedMessages) => {
      if (pinnedMessages.size > desiredPinCount) {
        var lastPinnedMessages = Array.from(pinnedMessages.last(pinnedMessages.size - desiredPinCount)).reverse();
        var pinPromises = [];

        lastPinnedMessages.map((lastPinnedMessage) => {
          const pinMessageCopy = copyMessageToEmbed(pinnedMessages.last());
          pinChannel.send(pinMessageCopy).catch((error) => failureCallBack(error));
          pinPromises.push(lastPinnedMessage.unpin());
        });

        return Promise.all(pinPromises).catch((error) => failureCallBack(error));
      }

      return Promise.resolve(true);
    })
    .catch((error) => failureCallBack(error));
}

function copyMessageToEmbed(message) {
  var embed = new Discord.RichEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL)
    .setDescription(message.content)
    .setColor("#e8b535");

  message.attachments.map((attachment) => {
    if (attachment.filename.endsWith("png") || attachment.filename.endsWith("jpg")) {
      embed.setImage(attachment.proxyURL);
    } else {
      embed.addField("Attachment", attachment.proxyURL);
    }
  });

  return embed;
}

client.login(credentials.token);
