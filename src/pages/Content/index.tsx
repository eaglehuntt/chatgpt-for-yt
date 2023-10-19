class ContentScript {
  private gptButtonContainer: HTMLDivElement | undefined;
  private gptButton: HTMLImageElement | undefined;

  constructor() {
    if (window.location.href.includes('youtube.com/watch')) {
      this.addGptButton();
      this.addNewChatListener();
      this.addNewGptPromptListener();
    } else if (window.location.href.includes('chat.openai.com')) {
      this.pasteGptPrompt();
    }
  }

  private addNewChatListener() {
    chrome.runtime.onMessage.addListener(async (message, sender, response) => {
      const { type, videoId } = message;
      if (type === 'NEW_CHAT') {
        await this.ensureClosedCaptionsActivated();
        chrome.runtime.sendMessage({ type: 'SAFE_FOR_GPT_PROMPT' });
      }
    });
  }

  private addNewGptPromptListener() {
    chrome.runtime.onMessage.addListener((message, sender, response) => {
      const { type, transcript } = message;
      if (type === 'GPT_PROMPT') {
        if (transcript) {
          this.sendGptPrompt();
        }
      }
    });
  }

  private pasteGptPrompt() {
    chrome.runtime.sendMessage({ type: 'GET_TRANSCRIPT' }, (response) => {
      const promptArea = document.getElementById(
        'prompt-textarea'
      ) as HTMLTextAreaElement;

      if (promptArea) {
        setTimeout(() => {
          promptArea.value = response;
          chrome.runtime.sendMessage({ type: 'CLEAR_TRANSCRIPT' });
        }, 3000);
      }
    });
  }

  private addGptButton() {
    this.gptButtonContainer = document.createElement('div');
    this.gptButton = document.createElement('img');

    if (this.gptButton) {
      this.gptButton.style.cursor = 'pointer';
      this.gptButton.src = chrome.runtime.getURL('icon-34.png'); // update later
      this.gptButton.className = 'ytp-button ' + 'gpt-button';
      this.gptButton.title = 'Start a ChatGPT prompt';

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

  private async ensureClosedCaptionsActivated(): Promise<void> {
    return new Promise((resolve) => {
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
          resolve();
        }, 500);
      }
    });
  }

  private sendGptPrompt() {
    // Open a new tab with your target URL
    const newTab = window.open('https://chat.openai.com/', '_blank');
  }
}

const contentScript = new ContentScript();
