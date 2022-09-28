const config = require("../config.json");
const prefix = config.prefix;

module.exports = {
  name: "messageCreate",
  async execute(msg) {
    const channel = msg.channel;
    const content = msg.content;

    if (!content.startsWith(prefix)) {
      return;
    }

    var args = content.substring(prefix.length).split(" ");
    var cmd = args[0];

    switch (cmd.toLowerCase()) {
      case "pinbot":
        await msg.channel.send(
          channel,
          `Hello, I'm PinBot! I'll automatically move your oldest pins to the #${pinChannelName} channel.\n` +
            `You can also pin messages using :${config.pinEmojiName}: as a reaction!\n` +
            `I'm still in beta right now, so please report any bugs you find to @RLee#4054. Enjoy!`
        );
        break;
    }
  },
};
