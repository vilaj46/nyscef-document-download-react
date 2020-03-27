import React from 'react';
import { backgroundSendMessage } from '../messages.js';
import types from '../types';

const Trash = ({ displayErrorMessage }) => {
  const onClick = () => {
    const documentList = document.querySelector('.documentList');
    if (documentList.children.length === 0) {
      displayErrorMessage('Add documents to the list first!');
    } else {
      backgroundSendMessage(types.REMOVED_DOCUMENTS, null);
      // eslint-disable-next-line no-undef
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === types.ATTEMPTED_TO_REMOVE_DOCUMENTS) {
          displayErrorMessage('Add documents to the list first!');
        } else {
          displayErrorMessage('');
        }
      });
    }
  };

  return (
    <div className='iconTrash' title='Remove Documents' onClick={onClick}>
      <div className='trashLid'></div>
      <div className='trashContainer'></div>
      <div className='trashLine1'></div>
      <div className='trashLine3'></div>
    </div>
  );
};

export default Trash;
