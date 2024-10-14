const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs'); // For logging feedback

// Replace with your bot token
const bot = new TelegramBot('7668456155:AAEowihWS-LawAhabB1iwQlGbd9lL3TYjaY', { polling: true });

// Store user state to track feedback responses
const userState = {};

// Function to send the main options menu
function sendOptionsMenu(chatId) {
  bot.sendMessage(chatId, "🎉 **Main Menu**: Select an option below ⬇️", {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: "📂 Dumps", callback_data: "option_1" }],
        [{ text: "📧 Contact Us", callback_data: "option_3" }],
        [{ text: "📝 Feedback", callback_data: "option_4" }],
        [{ text: "❓ Help & Info", callback_data: "help" }],
      ],
    },
  });
}

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "User";

  const welcomeMessage = `
👋 **Welcome, ${firstName}!**
I'm your friendly resource bot. 💼  
Explore the latest dumps, leave feedback, or get in touch! 🚀

👉 Use the buttons below to navigate.  
💡 Type /help for guidance if you’re lost!`;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  sendOptionsMenu(chatId); // Send the options menu
});

// Handle button clicks (callback queries)
bot.on("callback_query", (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case "option_1":
      // Send available dumps as clickable links
      bot.sendMessage(chatId, "📂 **Available Dumps:**\n\n1️⃣ [Dump 1](https://example.com/dump1)\n2️⃣ [Dump 2](https://example.com/dump2)", { parse_mode: 'Markdown' });
      break;

    case "option_3":
      // Contact information
      bot.sendMessage(chatId, "📧 **Contact:** Reach out at example@example.com");
      break;

    case "option_4":
      // Prompt the user to provide feedback
      bot.sendMessage(chatId, "📝 **Your Feedback Matters!**\nPlease type your feedback:");
      userState[chatId] = "option_4"; // Track that the user is in feedback mode
      break;

    case "help":
      // Display the help menu
      bot.sendMessage(chatId, `
❓ **Help & Info**  
- Use /start to restart the bot.  
- 📂 Access Dumps: Select "Dumps" in the menu.  
- 📝 Provide feedback to help us improve!  
- 📧 Contact us if needed.  

We're here to assist! 😊`, { parse_mode: 'Markdown' });
      break;

    default:
      // Handle invalid options gracefully
      bot.sendMessage(chatId, "⚠️ Invalid option. Please try again.");
      sendOptionsMenu(chatId); // Redirect to the main menu
      break;
  }
});

// Handle user messages, including feedback
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (userState[chatId] === "option_4") {
    // Process user feedback
    bot.sendMessage(chatId, "🙏 Thank you for your feedback! We truly appreciate it.");
    logToFile(`Feedback from ${chatId}: ${text}`);
    delete userState[chatId]; // Reset state after feedback
  } else if (!text.startsWith('/')) {
    // Handle other random messages
    bot.sendMessage(chatId, "I didn’t quite get that. Please use the menu buttons. 😊");
    sendOptionsMenu(chatId); // Redirect to the main menu
  }
});

// Function to log feedback and bot usage to a file
function logToFile(logText) {
  const log = `${new Date().toISOString()} - ${logText}\n`;
  fs.appendFileSync('bot_usage.log', log);
}

// Handle errors during polling
bot.on("polling_error", (error) => {
  console.error(`Polling error: ${error.code}`, error);
});

