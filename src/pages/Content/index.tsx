/*
ContentScirpt workflow:

  1. When the CS is initialized, a GPT button is created and appends itself to the YouTube toolbar. 
  
  2. The CS polls the current tab's URL every 500ms to check if the URL has changed. If so reinitialize the object. The functions are designed in a a way that the CS will not have unexpected behavior (ideally). 

  3. [ GPT_BUTTON_CLICKED ] : Sent when user clicks the GPT button.

  4. [ CLICK_CC_BUTTON ] : Received from BGS.

  5. CS automatically clicks the Closed Captions button in the YouTube toolbar. This causes YouTube to fetch the transcript from the API.
  
  6. [ SAFE_FOR_GPT_PROMPT ] : Sent to BGS after we can ensure that YouTube has sent the transcript API request.

  7. [ NEW_GPT_PROMPT ] : Received from BGS once it has parsed the transcript JSON and has it as a string

  8. [ GET_TRANSCRIPT ] : Sent to BGS and waits for its response. 
  
  9. Goes to ChatGPT and pastes the response string into the chatbar.

TODO: 
  - Refactor initializeContentScript, GET_TRANSCRIPT is being called twice
  - Bug: Sometimes GPT button does not show up in toolbar
*/

class ContentScript {
  private gptButtonContainer: HTMLDivElement | undefined;
  private gptButton: HTMLImageElement | undefined;
  private currentUrl: string | undefined;

  constructor() {
    this.addClickCCButtonListener();
    this.addNewGptPromptListener();

    this.currentUrl = window.location.href;
    this.setAction();

    // Poll the URL for changes every 500 milliseconds (adjust the interval as needed)
    setInterval(() => {
      this.checkUrlChange();
    }, 500);
  }

  private setAction() {
    // Refactor

    setTimeout(() => {
      this.addGptButton();
    }, 3000);

    if (window.location.href !== this.currentUrl) {
      this.currentUrl = window.location.href;
    } else if (window.location.href.includes('chat.openai.com')) {
      chrome.runtime.sendMessage({ type: 'GET_TRANSCRIPT' }, (response) => {
        this.pasteGptPrompt();
      });
    }
  }

  private checkUrlChange() {
    if (window.location.href !== this.currentUrl) {
      this.setAction();
    }
  }

  private addClickCCButtonListener() {
    chrome.runtime.onMessage.addListener(async (message, sender, response) => {
      const { type, videoId } = message;
      if (type === 'CLICK_CC_BUTTON') {
        await this.ensureClosedCaptionsActivated();
        chrome.runtime.sendMessage({ type: 'SAFE_FOR_GPT_PROMPT' });
      }
    });
  }

  private addNewGptPromptListener() {
    chrome.runtime.onMessage.addListener((message, sender, response) => {
      const { type, transcript } = message;
      if (type === 'NEW_GPT_PROMPT') {
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
    if (!this.gptButtonContainer) {
      this.gptButtonContainer = document.createElement('div');
    }

    if (!this.gptButton) {
      this.gptButton = document.createElement('img');
      this.gptButton.style.cursor = 'pointer';
      this.gptButton.src = chrome.runtime.getURL('icon-34.png'); // Update the image URL
      this.gptButton.className = 'ytp-button ' + 'gpt-button';
      this.gptButton.title = 'Start a ChatGPT prompt';
    }

    if (!this.gptButtonContainer.contains(this.gptButton)) {
      this.gptButtonContainer.appendChild(this.gptButton);

      const youtubeLeftControls = document.querySelector('.ytp-left-controls');

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
