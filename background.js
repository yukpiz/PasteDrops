chrome.commands.onCommand.addListener((command) => {
  if (command === "paste-drops") {
    sendPasteMessage();
  }
});

chrome.action.onClicked.addListener(() => {
  sendPasteMessage();
});

async function sendPasteMessage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { action: "paste-drops" });
  } catch (e) {
    // Content script not loaded yet, inject it first
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    await chrome.tabs.sendMessage(tab.id, { action: "paste-drops" });
  }
}
