import { userState } from './userState.js';
import { handleCallButton } from './features/callButton.js';
import { handleUrlButton } from './features/urlButton.js';
import { handleQuickReplyButton } from './features/quickReplyButton.js';
import { handleCopyButton } from './features/copyButton.js';

export async function handler(sock, msg) {
  if (!msg?.message) return;

  const from = msg.key.remoteJid;
  const state = userState.get(from) || { step: 'start' };

  let rowId;

  // ✅ LIST RESPONSE (WORKING)
  if (msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
    rowId = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
  }

  // (Optional) buttonsResponseMessage keep cheyyam future use
  const btnId = msg.message?.buttonsResponseMessage?.selectedButtonId;

  // ✅ Handle menu clicks
  if (rowId) {
    switch (rowId) {
      case 'call':
        await handleCallButton(sock, from);
        break;
      case 'url':
        await handleUrlButton(sock, from);
        break;
      case 'quick':
        await handleQuickReplyButton(sock, from);
        break;
      case 'copy':
        await handleCopyButton(sock, from);
        break;
      default:
        await sock.sendMessage(from, { text: '❌ Unknown option selected' });
    }
    return;
  }

  // (Optional quick reply fallback)
  if (btnId === 'quick_reply_demo') {
    await sock.sendMessage(from, { text: 'Ini contoh quick reply' });
    return;
  }

  // ✅ Show menu
  if (state.step === 'start' || state.step === 'menuMain') {
    await sendIntroMenu(sock, from);
    userState.set(from, { step: 'menuMain' });
  }
}

// ✅ WORKING MENU (LIST TYPE)
async function sendIntroMenu(sock, from) {
  await sock.sendMessage(from, {
    text: '🤖 Hello!\nChoose an option from the menu below:',
    footer: '© Atex Ovi 2025 — MIT License',
    buttonText: 'Open Menu',
    sections: [
      {
        title: 'Available Features',
        rows: [
          {
            title: '📞 Call Button',
            description: 'Example: Call Button',
            rowId: 'call',
          },
          {
            title: '🌐 URL Button',
            description: 'Example: URL Button',
            rowId: 'url',
          },
          {
            title: '⚡ Quick Reply',
            description: 'Example: Quick Reply Button',
            rowId: 'quick',
          },
          {
            title: '📋 Copy Button',
            description: 'Example: Copy Button',
            rowId: 'copy',
          },
        ],
      },
    ],
  });
}
