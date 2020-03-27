import types from '../../types.js';
import actions from './contentActions.js';
import storage from './storage.js';
import {
  backgroundSendMessage,
  calculateWidthOfPopup,
} from './contentUtils.js';

// implement drag and drop
// figure out other options
// 1. remember order of the documents because after we download or remove documents the index changes
// 2. Reset popup or reset session storage
// 3. Give option for starting index number
// limit certain keystrokes with errors or jst ignore and add _? ( on customName change functionality )
// style the custom name better in the content page ( make the text smaller probs? )
// default params on functions
// make sure we are using all the types

backgroundSendMessage(types.SET_DATA_FROM_CONTENT, {
  popupWidth: calculateWidthOfPopup(),
  documents: sessionStorage.getItem('documents'),
  options: sessionStorage.getItem('options'),
  appCodeName: navigator.vendor,
});

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case types.SET_DATA_FROM_BACKGROUND:
      return actions.setData(message.payload);
    case types.ADDED_DOCUMENT:
      return actions.addedDocument(message.payload);
    case types.REMOVED_DOCUMENT:
      return actions.removedDocument(message.payload);
    case types.CHANGED_DOCUMENT_NAME:
      return actions.changedDocumentName(message.payload);
    case types.REMOVED_DOCUMENTS:
      return actions.removedDocuments(message.payload);
    case types.UPDATED_DOCUMENT_INDEX:
      return actions.updateDocumentName(message.payload);
    case types.TOGGLED_SELECT_ALL_DOCUMENTS:
      return storage.replaceDocuments(message.payload);
    case types.TOGGLED_OPTIONS:
      return storage.replaceOptions(message.payload);
    case types.SELECTED_DOCUMENT:
      return storage.replaceDocuments(message.payload);
    case types.REMOVED_INDEXES_FROM_NAME:
      return storage.replaceDocuments(message.payload);
    case types.ADDED_INDEXES_TO_NAME:
      return storage.replaceDocuments(message.payload);
    default:
      return;
  }
});
