(() => {
  let currentVideo = "";

  // Listen for a "NEW" message. This will indicate there is a new video
  chrome.runtime.onMessage.addListener((message, sender, response) => {
    const { type, videoId } = message;
    console.log(message);

    if (type == "NEW") {
      currentVideo = videoId;
      activeVideo();
    }
  });

  const ensureClosedCaptionsActivated = () => {
    // Select the CC button on the YouTube video player using aria-label.
    // We need to do this in order to intercept the api call.
    const ccButton = document.querySelector(".ytp-subtitles-button.ytp-button");

    // Check if the CC button exists and whether it is pressed (activated).
    if (ccButton && ccButton.getAttribute("aria-pressed") !== "true") {
      // CC button is not activated, so activate and deactivate it quickly.
      ccButton.click();

      // Optional: Wait for a moment before deactivating (adjust timing as needed).
      setTimeout(() => {
        ccButton.click();
      }, 500);
    }
  };

  const activeVideo = () => {
    ensureClosedCaptionsActivated();
  };
})();
