chrome.commands.onCommand.addListener((command) => {
  if (command === "paste-drops") {
    injectAndExecute();
  }
});

chrome.action.onClicked.addListener(() => {
  injectAndExecute();
});

async function injectAndExecute() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: pasteDropsExecute,
  });
}

async function pasteDropsExecute() {
  let text;
  try {
    text = await navigator.clipboard.readText();
  } catch (e) {
    showNotification("Clipboard access denied", "error");
    return;
  }

  if (!text || !text.trim()) {
    showNotification("Clipboard is empty", "error");
    return;
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    showNotification("Clipboard is not valid JSON", "error");
    return;
  }

  if (!data.fields || !Array.isArray(data.fields)) {
    showNotification('JSON must have a "fields" array', "error");
    return;
  }

  let filled = 0;
  let errors = [];

  for (const field of data.fields) {
    if (!field.target || field.value === undefined) {
      errors.push(`Invalid field: missing "target" or "value"`);
      continue;
    }

    let el;
    try {
      el = document.querySelector(field.target);
    } catch (e) {
      errors.push(`Invalid selector: ${field.target}`);
      continue;
    }

    if (!el) {
      errors.push(`Not found: ${field.target}`);
      continue;
    }

    el.value = field.value;
    filled++;
  }

  if (errors.length > 0) {
    showNotification(
      `Filled ${filled}/${data.fields.length} fields\n${errors.join("\n")}`,
      filled > 0 ? "warn" : "error"
    );
  } else {
    showNotification(`Filled ${filled} fields`, "success");
  }

  function showNotification(message, type) {
    const existing = document.getElementById("pastedrops-notification");
    if (existing) existing.remove();

    const colors = {
      success: { bg: "#10b981", border: "#059669" },
      warn: { bg: "#f59e0b", border: "#d97706" },
      error: { bg: "#ef4444", border: "#dc2626" },
    };
    const color = colors[type] || colors.success;

    const div = document.createElement("div");
    div.id = "pastedrops-notification";
    div.textContent = message;
    Object.assign(div.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "2147483647",
      padding: "12px 20px",
      borderRadius: "8px",
      backgroundColor: color.bg,
      border: `2px solid ${color.border}`,
      color: "#fff",
      fontSize: "14px",
      fontFamily: "system-ui, sans-serif",
      fontWeight: "600",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      whiteSpace: "pre-line",
      maxWidth: "400px",
      transition: "opacity 0.3s ease",
    });

    document.body.appendChild(div);
    setTimeout(() => {
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 300);
    }, 3000);
  }
}
