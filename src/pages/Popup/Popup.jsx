import React from 'react';
import logo from '../../assets/img/icon-128.png';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';

const Popup = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>This extension is in active development.</p>
        <a
          className="App-link"
          href="https://github.com/eaglehuntt/chatgpt-for-yt/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Report an issue
        </a>
      </header>
    </div>
  );
};

export default Popup;
