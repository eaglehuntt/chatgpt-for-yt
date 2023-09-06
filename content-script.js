(() => {
  let currentVideo = "";

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      activeVideo();
    } else {
      inactiveVideo();
    }
  });

  const ensureClosedCaptionsActivated = () => {
    // Select the CC button on the YouTube video player using aria-label.
    const ccButton = document.querySelector(
      'button[aria-label="Subtitles/closed captions keyboard shortcut c"]'
    );

    // Check if the CC button exists and whether it is pressed (activated).
    if (ccButton && ccButton.getAttribute("aria-pressed") !== "true") {
      // CC button is not activated, so activate and deactivate it quickly.
      ccButton.click();

      // Optional: Wait for a moment before deactivating (adjust timing as needed).
      setTimeout(() => {
        ccButton.click();
        console.log("Closed captions activated and deactivated.");
      }, 500);
    }
  };

  const inactiveVideo = () => {
    console.log("Video is inactive!");
  };

  const activeVideo = () => {
    console.log("WORKING");
    //ensureClosedCaptionsActivated();
  };
})();
