// Listen for "LOADED" message
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "LOADED") {
    // Get the active tab information
    await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      // Check if it's a YouTube video
      if (tab.status === "complete" && tab.url.includes("youtube.com/watch")) {
        console.log("YouTube video detected:", tab.url);

        // queryParameters: unique video ID after the "?" in a YouTube URL
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);

        // Send a "NEW" message to the content script
        chrome.tabs.sendMessage(tab.id, {
          type: "NEW",
          videoId: urlParameters.get("v"),
        });
      }
    });
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    // Check if you want to process this request based on details.url or other criteria.
    if (details.url.includes("youtube.com/api/timedtext")) {
      // You can access details.url and other information of the request here.

      // To manipulate the request or cancel it, you can use details.requestBody or details.responseHeaders.
      // For example, you can modify headers before sending the request.
      // To cancel the request, use `return { cancel: true };`

      // Here, you can perform actions on the intercepted request.
      console.log("Intercepted request:", details.url);

      // If you need to modify the request or response, you can do it here.
    }
  },
  {
    urls: ["https://www.youtube.com/api/timedtext*"], // Specify the URL patterns to intercept.
    types: ["xmlhttprequest"], // Specify the types of requests to intercept.
  },
  []
);
