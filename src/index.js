import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';
import types from './types.js';
import { backgroundSendMessage } from './messages.js';
// ReactDOM.render(
//   <React.StrictMode>
//     <App data={{ popupWidth: 600 }} />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

backgroundSendMessage(types.RENDERED_POPUP);

const renderPopup = data => {
  ReactDOM.render(<App data={data} />, window.document.getElementById('root'));
};

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case types.RENDERED_POPUP:
      return renderPopup(message.payload);
    default:
      return;
  }
});
