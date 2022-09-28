# PinBot
By RLee (Discord user RLee#4054)

A simple Discord bot that helps you deal with that pesky 50-pin limit on your favourite channels.
Whenever you are trying to pin more messages than the pinned section allows, PinBot will archive your oldest pins into the `#pins` channel.

Try the following!
* Pin as many pins as you want, old pins automatically get archived into `#pins`
* Commands
  * `/moveoldestpin`: Automatically archive the oldest pin
  * `/randompin`: Show an old pin for old time's sake

## Setup
1. Add PinBot to your server.
2. Create a channel named `pins` and make sure PinBot can send messages on the channel


Start with start.bat
Kill with CTRL+C

Add me URL is: https://discordapp.com/oauth2/authorize?&client_id=499817825020674049&scope=bot&permissions=1141369920

## deploy-commands.js
This file only needs to be run once per udpate to / commands
```
node deploy-commands.js
```