class BackgroundScript {
  constructor() {
    this.addButtonEventListener();
    this.addTranscriptEventListener();
    this.addGetTranscriptListener();
    this.addSafeForGptPromptListener();
    this.addClearTranscriptListener();
  }

  addButtonEventListener() {
    chrome.runtime.onMessage.addListener(async (message, sender, response) => {
      if (message.type === 'GPT_BUTTON_CLICKED') {
        this.getActiveTabInformation((tab) => {
          if (this.isYouTubeVideo(tab)) {
            const queryParameters = new URLSearchParams(tab.url.split('?')[1]);
            chrome.tabs.sendMessage(tab.id, {
              type: 'NEW_CHAT',
              videoId: queryParameters.get('v'),
            });
          }
        });
      }
    });
  }

  addTranscriptEventListener() {
    chrome.webRequest.onCompleted.addListener(this.interceptTranscriptApiCall, {
      urls: ['https://www.youtube.com/api/timedtext*'],
      types: ['xmlhttprequest'],
    });
  }

  addGetTranscriptListener() {
    chrome.runtime.onMessage.addListener((message, sender, response) => {
      if (message.type === 'GET_TRANSCRIPT') {
        response(this.transcript);
      }
    });
  }

  addSafeForGptPromptListener() {
    chrome.runtime.onMessage.addListener((message, sender, response) => {
      if (message.type === 'SAFE_FOR_GPT_PROMPT') {
        if (this.transcript) {
          this.sendGptPromptMessage();
        } else {
          console.log('Error, no transcript');
        }
      }
    });
  }

  addClearTranscriptListener() {
    chrome.runtime.onMessage.addListener((message, sender, response) => {
      if (message.type === 'CLEAR_TRANSCRIPT') {
        this.transcript = '';
        this.addTranscriptEventListener();
      }
    });
  }

  interceptTranscriptApiCall = async (details) => {
    if (details.url.includes('youtube.com/api/timedtext')) {
      try {
        const response = await fetch(details.url);
        if (!response.ok) {
          throw new Error('Fetch failed with status ' + response.status);
        }
        let data = await response.text();
        data = JSON.parse(data);
        this.transcript = this.getTranscriptFromJson(data);
        // Remove the listener to avoid intercepting multiple times
        chrome.webRequest.onCompleted.removeListener(
          this.interceptTranscriptApiCall
        );
      } catch (error) {
        console.error('There was an error intercepting the transcript');
        console.error(error);
      }
    }
  };

  sendGptPromptMessage() {
    this.getActiveTabInformation((tab) => {
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'GPT_PROMPT',
          transcript: this.transcript,
        });
      } else {
        console.error('No active tab found.');
      }
    });
  }

  getTranscriptFromJson(data) {
    let transcript = '';
    let events = data.events;
    for (let i = 0; i < events.length; i++) {
      if (events[i].hasOwnProperty('segs')) {
        let segs = events[i].segs;
        for (let j = 0; j < segs.length; j++) {
          if (segs[j].utf8) {
            transcript += `${segs[j].utf8} `;
          }
        }
      }
    }
    transcript = transcript.trim();
    return transcript;
  }

  getActiveTabInformation(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        callback(tabs[0]);
      } else {
        callback(null);
      }
    });
  }

  isYouTubeVideo(tab) {
    return tab.status === 'complete' && tab.url.includes('youtube.com/watch');
  }
}

// Instantiate and run the YouTubeExtension class
const youtubeExtension = new BackgroundScript();
