(() => {
  class ContentScript {
    constructor() {
      if (window.location.href.includes("youtube.com/watch")) {
        this.addGptButton();
      }
    }

    addGptButton() {
      const gptButtonExists = document.getElementsByClassName("gpt-button")[0];

      if (!gptButtonExists) {
        const gptButton = document.createElement("img");

        gptButton.style.cursor = "pointer";
        gptButton.src = chrome.runtime.getURL("assets/bookmark.png"); // update later
        gptButton.className = "ytp-button" + "gpt-button";
        gptButton.title = "Click to start ChatGPT prompt";

        const youtubeLeftControls =
          document.getElementsByClassName("ytp-left-controls")[0];

        //const youtubePlayer =
        //  document.getElementsByClassName("video-stream")[0];

        youtubeLeftControls.append(gptButton);

        gptButton.addEventListener("click", () => {
          chrome.runtime.sendMessage({
            type: "GPT_BUTTON_CLICKED",
          });
        });
      }
    }

    ensureClosedCaptionsActivated() {
      // Select the CC button on the YouTube video player using aria-label.
      // We need to do this in order to intercept the api call.
      const ccButton = document.querySelector(
        ".ytp-subtitles-button.ytp-button"
      );

      // Check if the CC button exists and whether it is pressed (activated).
      if (ccButton && ccButton.getAttribute("aria-pressed") !== "true") {
        // CC button is not activated, so activate and deactivate it quickly.
        ccButton.click();

        // Optional: Wait for a moment before deactivating (adjust timing as needed).
        setTimeout(() => {
          ccButton.click();
        }, 500);
      }
    }
  }

  const contentScript = new ContentScript();

  // Listen for a "NEW" message. This will indicate there is a new video
  chrome.runtime.onMessage.addListener((message, sender, response) => {
    const { type, videoId } = message;

    if (type == "NEW_CHAT") {
      currentVideo = videoId;
      contentScript.ensureClosedCaptionsActivated();
      // this is where the chatbox will be generated.
    }
  });
})();
