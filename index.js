const TelegramBot = require('node-telegram-bot-api');
const token = require("./config").botToken;
const bot = new TelegramBot(token, {polling: true});
const loki = require("lokijs");
const db = new loki('loki.json', {
 	autosave: true, 
	autosaveInterval: 10000 
});

let thoughts;

function databaseInitialize() {
  thoughts = db.getCollection('thoughts');
  if (thoughts === null) {
    thoughts = db.addCollection("thoughts");
  }
}

db.loadDatabase({}, function(err) {
  if (err) throw err;
  databaseInitialize();
  console.log("db initialized");
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Hi ${msg.chat.first_name}! I'm Tim and i'll be your guide in your book reading journey!`);
  bot.sendMessage(msg.chat.id, `Send a /thought {your thoughts} message to store your thoughts`);
});

bot.onText(/\/thought(.+)/, (msg, match) => {
  let thought = match[1];
  thoughts.insert({id: msg.chat.id, thought});
  bot.sendMessage(msg.chat.id, "Thanks!");
  db.saveDatabase();
});

bot.onText(/\/recap/, (msg) => {
  console.log(thoughts);
  var all = thoughts.find({id: msg.chat.id});
  console.log(all);
  const userThoughts = all.filter(thought => thought.id === msg.chat.id);
  if (userThoughts.length === 0) {
    bot.sendMessage(msg.chat.id, `No thoughts yet. Add some!`);
  }
  userThoughts.forEach(element => {
    let dt = new Date(element.meta.created);
    bot.sendMessage(msg.chat.id, `${element.thought} - ${dt.getDate()}/${(dt.getMonth() + 1)}/${dt.getFullYear()}`);
  });
});