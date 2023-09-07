(() => {
  let currentVideo = "";

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;
    console.log(obj);

    if (type == "NEW") {
      currentVideo = videoId;
      activeVideo();
    }
  });

  const ensureClosedCaptionsActivated = () => {
    // Select the CC button on the YouTube video player using aria-label.
    const ccButton = document.querySelector(".ytp-subtitles-button.ytp-button");

    console.log(ccButton);

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
