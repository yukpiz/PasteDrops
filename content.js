chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "paste-drops") {
    executePaste();
  }
});

async function executePaste() {
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
      errors.push('Invalid field: missing "target" or "value"');
      continue;
    }

    let el;
    try {
      el = document.querySelector(field.target);
    } catch (e) {
      errors.push("Invalid selector: " + field.target);
      continue;
    }

    if (!el) {
      errors.push("Not found: " + field.target);
      continue;
    }

    setNativeValue(el, field.value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    filled++;
  }

  if (errors.length > 0) {
    showNotification(
      "Filled " + filled + "/" + data.fields.length + " fields\n" + errors.join("\n"),
      filled > 0 ? "warn" : "error"
    );
  } else {
    showNotification("Filled " + filled + " fields", "success");
  }
}

function setNativeValue(el, value) {
  // React overrides the value setter on input/textarea elements.
  // Using the native HTMLInput/TextArea prototype setter ensures
  // React's internal state gets updated properly.
  var prototype = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  var nativeSetter = Object.getOwnPropertyDescriptor(prototype, "value");
  if (nativeSetter && nativeSetter.set) {
    nativeSetter.set.call(el, value);
  } else {
    el.value = value;
  }
}

function showNotification(message, type) {
  var existing = document.getElementById("pastedrops-notification");
  if (existing) existing.remove();

  var colors = {
    success: { bg: "#10b981", border: "#059669" },
    warn: { bg: "#f59e0b", border: "#d97706" },
    error: { bg: "#ef4444", border: "#dc2626" },
  };
  var color = colors[type] || colors.success;

  var div = document.createElement("div");
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
    border: "2px solid " + color.border,
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
  setTimeout(function () {
    div.style.opacity = "0";
    setTimeout(function () { div.remove(); }, 300);
  }, 3000);
}
