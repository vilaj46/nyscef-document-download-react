/* eslint-disable no-undef */
import types from '../../types.js';
import { popupSendMessage } from '../../messages.js';
import __DATA__ from './backgroundData.js';

popupSendMessage('OPENED_POPUP');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case types.SET_DATA_FROM_CONTENT:
      return __DATA__.setData(message.payload);
    case types.ADDED_DOCUMENT:
      return __DATA__.addDocument(message.payload);
    case types.REMOVED_DOCUMENT:
      return __DATA__.removeDocument(message.payload);
    case types.REMOVED_DOCUMENTS:
      return __DATA__.removeDocuments();
    case types.RENDERED_POPUP:
      return __DATA__.renderPopup();
    case types.SELECTED_DOCUMENT:
      return __DATA__.selectedDocument(message.payload);
    case types.CHANGED_DOCUMENT_NAME:
      return __DATA__.changeDocumentName(message.payload);
    case types.TOGGLED_SELECT_ALL_DOCUMENTS:
      return __DATA__.toggleDocumentsSelect(message.payload);
    case types.CHECKED_ALL_DOCUMENTS_SELECTED:
      return __DATA__.checkIfAllDocumentsSelected();
    case types.GET_DOCUMENTS:
      return popupSendMessage(types.GET_DOCUMENTS_BACK, __DATA__.documents);
    case types.TOGGLED_OPTIONS:
      return __DATA__.toggledOption(message.payload);
    case types.GET_OPTIONS:
      return __DATA__.getOption(message.payload);
    case types.DOCUMENT_FAILED_DOWNLOAD:
      return __DATA__.setFailedToDownload(message.payload);
    case types.GET_APP_CODE_NAME:
      return popupSendMessage(
        types.GET_APP_CODE_NAME_BACK,
        __DATA__.appCodeName
      );
    default:
      return;
  }
});
