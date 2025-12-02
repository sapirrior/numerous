import { Client, GatewayIntentBits, Collection, Events, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { CONFIG } from "./config.js";
import { getUserKey } from "./utils/data.js";
import { isOnCooldown } from "./utils/cooldown.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(filePath);
  client.commands.set(command.default.data.name, command.default);
}

// Deploy global slash commands automatically
client.once(Events.ClientReady, async () => {
  console.log(`Bot online as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  const slashCommands = client.commands.map(cmd => cmd.data.toJSON());

  await rest.put(Routes.applicationCommands(client.user.id), { body: slashCommands });
  console.log("Global slash commands deployed.");
});

// Slash command handling
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "An error occurred.", ephemeral: true });
  }
});

// Ping-only chat
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user.id)) return;

  // Cooldown check
  if (isOnCooldown(message.author.id, CONFIG.cooldownTime)) return;

  const geminiKey = getUserKey(message.author.id);
  if (!geminiKey) return; // user has no key

  const userText = message.content.replace(`<@${client.user.id}>`, "").trim();

  // Message length check
  if (userText.length > CONFIG.maxMessageLength) {
    await message.reply(`Your message is too long. Max length is ${CONFIG.maxMessageLength} characters.`);
    return;
  }

  const prompt = `${message.author.username} says: ${userText}`;

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "You are Numerous, a funny, casual Discord bot created by altAI, only reply in text, short and witty (~10 words max), never mention AI.",
      generationConfig: { temperature: 0.9, maxOutputTokens: 15 }
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const reply = result.response.text()?.trim();
    if (reply) await message.reply(reply);

  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);