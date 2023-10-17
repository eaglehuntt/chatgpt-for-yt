class BackgroundScript {
  constructor() {
    this.addButtonEventListener();
    this.addTranscriptEventListener();
    this.addGetTranscriptListener();
    //this.addClosedCaptionsListener();
  }

  addButtonEventListener() {
    chrome.runtime.onMessage.addListener(async (message, sender, response) => {
      if (message.type === 'GPT_BUTTON_CLICKED') {
        console.log('Got button clicked message');
        this.getActiveTabInformation((tab) => {
          if (this.isYouTubeVideo(tab)) {
            const queryParameters = new URLSearchParams(tab.url.split('?')[1]);
            console.log('Sending new chat message');
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

  interceptTranscriptApiCall = async (details) => {
    if (details.url.includes('youtube.com/api/timedtext')) {
      try {
        console.log('Running interception');
        const response = await fetch(details.url);
        if (!response.ok) {
          throw new Error('Fetch failed with status ' + response.status);
        }
        let data = await response.text();
        data = JSON.parse(data);
        this.transcript = this.getTranscriptFromJson(data);
        //quick fix change later
        this.sendTranscriptMessage();
      } catch (error) {
        console.error('There was an error intercepting the transcript');
        console.error(error);
      }
    }
  };

  sendTranscriptMessage() {
    this.getActiveTabInformation((tab) => {
      if (tab) {
        console.log('Sending transcript message');
        chrome.tabs.sendMessage(tab.id, {
          type: 'TRANSCRIPT',
          transcript: this.transcript,
        });
        // Remove the listener to avoid intercepting multiple times
        chrome.webRequest.onCompleted.removeListener(
          this.interceptTranscriptApiCall
        );
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
