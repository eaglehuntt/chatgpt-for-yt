document.addEventListener("DOMContentLoaded", async () => {
  // Once the popup is clicked and loaded, send a "LOADED" message to the background script
  chrome.runtime.sendMessage({ type: "LOADED" });
});
