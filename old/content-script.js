(() => {
  class ContentScript {
    constructor() {
      if (window.location.href.includes('youtube.com/watch')) {
        this.addGptButton();
        this.addChatbox();
      }

      // NEW_CHAT Listener
      chrome.runtime.onMessage.addListener((message, sender, response) => {
        const { type, videoId } = message;

        if (type == 'NEW_CHAT') {
          contentScript.ensureClosedCaptionsActivated();

          // this is where the chatbox will be generated.
        }
      });

      /* chrome.runtime.onMessage.addListener((message, sender, response) => {
        if (message.type == "") {
        }
      }); */
    }

    addChatbox() {
      const chatboxExists = document.getElementById('chatbox');

      if (!chatboxExists) {
        // Create the chatbox container using template literals for HTML and CSS
        const chatboxContainer = document.createElement('div');
        chatboxContainer.id = 'chatbox'; // Assign an id to the div

        chatboxContainer.innerHTML = `
          <div class="chat-messages" style="
            max-height: 200px;
            overflow-y: scroll;
            padding: 5px;
          "></div>
          <textarea class="input-message" placeholder="Type your message..." style="
            width: 100%;
            padding: 5px;
            margin-top: 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
            resize: none;
          "></textarea>
          <button class="send-button" style="
            display: block;
            margin-top: 10px;
            background-color: #0073e6;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            cursor: pointer;
          ">Send</button>
        `;

        chatboxContainer.style.cssText = `
          background-color: #f5f5f5;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          width: 20%;
          height: 35%;
          position: fixed;
          padding: 10px;
          z-index: 9999;
        `;

        // Append the chatbox container to the body
        document.body.appendChild(chatboxContainer);
      }
    }

    addGptButton() {
      const gptButtonExists = document.getElementsByClassName('gpt-button')[0];

      if (!gptButtonExists) {
        const gptButton = document.createElement('img');

        gptButton.style.cursor = 'pointer';
        gptButton.src = chrome.runtime.getURL('assets/bookmark.png'); // update later
        gptButton.className = 'ytp-button ' + 'gpt-button';
        gptButton.title = 'Click to start a ChatGPT prompt';

        const youtubeLeftControls =
          document.getElementsByClassName('ytp-left-controls')[0];

        //const youtubePlayer =
        //  document.getElementsByClassName("video-stream")[0];

        youtubeLeftControls.append(gptButton);

        gptButton.addEventListener('click', () => {
          this.toggleChatbox();
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
