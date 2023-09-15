import React from 'react';
import ReactDOM from 'react-dom';
import Chatbox from './Chatbox';

(() => {
  class ContentScript {
    constructor() {
      if (window.location.href.includes('youtube.com/watch')) {
        this.addGptButton();

        this.chatbox = document.createElement('div');
        this.chatbox.classList.add('hidden');

        this.addChatbox();
      }

      // NEW_CHAT Listener
      chrome.runtime.onMessage.addListener((message, sender, response) => {
        const { type, videoId } = message;

        if (type == 'NEW_CHAT') {
          contentScript.ensureClosedCaptionsActivated();

          this.chatbox.classList.remove('hidden');

          /* const gptButtonElement = document.querySelector(
            '.ytp-button.gpt-button'
          );
 */
          /*  if (this.gptButton) {
            const rect = gptButtonElement.getBoundingClientRect();
            this.chatbox.style.top =
              rect.top - this.chatbox.clientHeight - 10 + 'px';
            this.chatbox.style.left = rect.left + 'px';
          } */
        }
      });
    }

    addChatbox() {
      const chatboxExists = document.getElementById('chatbox');

      if (!chatboxExists) {
        this.gptButtonContainer.appendChild(this.chatbox);
        ReactDOM.render(<Chatbox />, this.chatbox);
      }
    }

    addGptButton() {
      const gptButtonExists = document.getElementsByClassName('gpt-button')[0];

      if (!gptButtonExists) {
        this.gptButtonContainer = document.createElement('div');
        this.gptButton = document.createElement('img');

        this.gptButton.style.cursor = 'pointer';
        this.gptButton.src = chrome.runtime.getURL('../../././img-34.png'); // update later
        this.gptButton.className = 'ytp-button ' + 'gpt-button';
        this.gptButton.title = 'Click to start a ChatGPT prompt';

        this.gptButtonContainer.appendChild(this.gptButton);

        const youtubeLeftControls =
          document.getElementsByClassName('ytp-left-controls')[0];

        //const youtubePlayer =
        //  document.getElementsByClassName("video-stream")[0];

        youtubeLeftControls.appendChild(this.gptButtonContainer);

        this.gptButton.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            type: 'GPT_BUTTON_CLICKED',
          });
        });
      }
    }

    toggleChatbox() {
      // Toggle the visibility of the chatbox
      if (this.chatboxIframe.style.display === 'none') {
        this.chatboxIframe.style.display = 'block';
      } else {
        this.chatboxIframe.style.display = 'none';
      }
    }

    ensureClosedCaptionsActivated() {
      // Select the CC button on the YouTube video player using aria-label.
      // We need to do this in order to intercept the api call.
      const ccButton = document.querySelector(
        '.ytp-subtitles-button.ytp-button'
      );

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
})();
