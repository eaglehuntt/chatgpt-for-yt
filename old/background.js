chrome.runtime.onMessage.addListener(async (message, sender, response) => {
  if (message.type == 'GPT_BUTTON_CLICKED') {
    // Get the active tab information
    await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      // Check if it's a YouTube video. Redundant checking, but better to be safe
      if (tab.status === 'complete' && tab.url.includes('youtube.com/watch')) {
        console.log('YouTube video detected:', tab.url);

        // queryParameters: unique video ID after the "?" in a YouTube URL
        const queryParameters = tab.url.split('?')[1];
        const urlParameters = new URLSearchParams(queryParameters);

        // Send a "NEW" message to the content script
        chrome.tabs.sendMessage(tab.id, {
          type: 'NEW_CHAT',
          videoId: urlParameters.get('v'),
        });
      }
    });
  }
});

const interceptTranscriptApiCall = async (details) => {
  if (details.url.includes('youtube.com/api/timedtext')) {
    try {
      const response = await fetch(details.url);
      let data = await response.text();
      data = JSON.parse(data);

      getTranscriptFromJson(data);

      console.log(`Transcript: ${getTranscriptFromJson(data)}`);
      // FIX BUG. THIS STAYS REMOVED
      chrome.webRequest.onCompleted.removeListener(interceptTranscriptApiCall);
    } catch (error) {
      console.error('There was an error intercepting the transcript');
      console.error(error);
    }
  }
};

const getTranscriptFromJson = (data) => {
  let transcript = '';

  let events = data.events;

  // iterate over every item in the events array
  for (let i = 0; i < events.length; i++) {
    // if that item has a segement
    if (Object.hasOwn(events[i], 'segs')) {
      let segs = events[i].segs;
      // iterate over all items in the segment array and add them to the transcript string
      for (let j = 0; j < segs.length; j++) {
        if (segs[j].utf8) {
          transcript += `${segs[j].utf8} `;
        }
      }
    }
  }

  transcript = transcript.trim();
  return transcript;
};

// Add the listener
chrome.webRequest.onCompleted.addListener(interceptTranscriptApiCall, {
  urls: ['https://www.youtube.com/api/timedtext*'], // Specify the URL patterns to intercept.
  types: ['xmlhttprequest'], // Specify the types of requests to intercept.
});
