class ContentScript {
  private chatbox: HTMLDivElement | undefined;
  private gptButtonContainer: HTMLDivElement | undefined;
  private gptButton: HTMLImageElement | undefined;

  constructor() {
    if (window.location.href.includes('youtube.com/watch')) {
      this.addGptButton();
    }

    // NEW_CHAT Listener
    chrome.runtime.onMessage.addListener((message, sender, response) => {
      const { type, videoId } = message;

      if (type === 'NEW_CHAT') {
        this.ensureClosedCaptionsActivated();
      }
    });
  }

  private addGptButton() {
    this.gptButtonContainer = document.createElement('div');
    this.gptButton = document.createElement('img');

    if (this.gptButton) {
      this.gptButton.style.cursor = 'pointer';
      this.gptButton.src = chrome.runtime.getURL('../../././img-34.png'); // update later
      this.gptButton.className = 'ytp-button ' + 'gpt-button';
      this.gptButton.title = 'Click to start a ChatGPT prompt';

      this.gptButtonContainer.appendChild(this.gptButton);

      const youtubeLeftControls =
        document.getElementsByClassName('ytp-left-controls')[0];

      if (youtubeLeftControls) {
        youtubeLeftControls.appendChild(this.gptButtonContainer);

        this.gptButton.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            type: 'GPT_BUTTON_CLICKED',
          });
        });
      }
    }
  }

  private ensureClosedCaptionsActivated() {
    // Select the CC button on the YouTube video player using aria-label.
    // We need to do this in order to intercept the api call.
    const ccButton = document.querySelector(
      '.ytp-subtitles-button.ytp-button'
    ) as HTMLButtonElement;

    // Check if the CC button exists and whether it is pressed (activated).
    if (ccButton && ccButton.getAttribute('aria-pressed') !== 'true') {
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
