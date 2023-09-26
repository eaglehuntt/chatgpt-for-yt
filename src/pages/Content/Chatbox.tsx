import React from 'react';
import './Chatbox.css'; // Import the CSS file for the chatbox styles

function Chatbox() {
  return (
    <div id="chatbox">
      <div className="chat-messages"></div>
      <textarea
        className="input-message"
        placeholder="Type your message..."
      ></textarea>
      <button className="send-button">Send</button>
    </div>
  );
}

export default Chatbox;
