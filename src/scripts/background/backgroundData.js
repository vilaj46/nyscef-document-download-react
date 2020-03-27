import types from '../../types.js';
import { contentSendMessage, popupSendMessage } from '../../messages.js';
import {
  configureDocumentSelected,
  calculateNumberOfDocumentsSelected,
  getIdsStartingIndexNewDocumentsAfterRemoval,
  changeIndexesOfDocumentsAfterRemoval,
  addIndexesToName,
  removeIndexesFromName,
} from './backgroundUtils.js';

/**
 * Sets the data according to a few conditions
 * Triggered from the content script on initial load.
 * If the options / documents are null we are initially loading the extension.
 * We also check if we have the save on refresh option is selected and
 * if our originalName has the index.
 * @param {Object} storage object which includes documents and options
 */
function setData(storage) {
  const parsedStorage = {
    documents: JSON.parse(storage.documents),
    options: JSON.parse(storage.options),
  };

  // If options is null, we would get an error checking for saveOnRefresh.
  if (parsedStorage.options === null) {
    parsedStorage.options = {};
    parsedStorage.documents = [];
  }

  if (parsedStorage.options.saveOnRefresh === true) {
    this.documents = parsedStorage.documents;
    this.options = parsedStorage.options;
  } else {
    this.documents = [];
    // fix self assign
    this.options = this.options;
    this.numberOfSelectedDocuments = 0;
  }

  const firstDoc =
    this.documents.length > 0 ? this.documents[0] : { originalName: '' };
  firstDoc.originalName =
    firstDoc.originalName.length > 0 ? firstDoc.originalName : '';
  if (
    parsedStorage.options.showIndexInName === true &&
    parsedStorage.documents.length > 0 &&
    !firstDoc.originalName.includes(`${firstDoc.index}. `)
  ) {
    this.documents = this.documents.map((doc, index) => {
      return {
        ...doc,
        customName: `${index}. ${doc.customName}`,
        originalName: `${index}. ${doc.originalName}`,
      };
    });
  }

  this.popupWidth = storage.popupWidth;
  this.numberOfSelectedDocuments = 0;
  this.appCodeName = storage.appCodeName;
  contentSendMessage(types.SET_DATA_FROM_BACKGROUND, {
    documents: this.documents,
    options: this.options,
  });
  popupSendMessage(types.SET_DATA_FROM_BACKGROUND, storage.appCodeName);
  return;
}

/**
 * Selects the changed option and switches it.
 * Send back the approved change to the popup script
 * Send an update to the sessionStorage in the content script.
 * @param {String} key is the string to the option clicked
 */
function toggledOption(key) {
  const currentOption = this.options[key];
  this.options[key] = !currentOption;
  popupSendMessage(types.TOGGLED_OPTIONS_BACK, {
    option: key,
    fillCheckbox: !currentOption,
  });
  contentSendMessage(types.TOGGLED_OPTIONS, this.options);
  if (key === 'showIndexInName' && !currentOption === false) {
    this.documents = removeIndexesFromName(this.documents);
    contentSendMessage(types.REMOVED_INDEXES_FROM_NAME, this.documents);
    popupSendMessage(types.REMOVED_INDEXES_FROM_NAME, this.documents);
  } else if (key === 'showIndexInName' && !currentOption === true) {
    this.documents = addIndexesToName(this.documents);
    contentSendMessage(types.ADDED_INDEXES_TO_NAME, this.documents);
    popupSendMessage(types.ADDED_INDEXES_TO_NAME, this.documents);
  }
  return;
}

/**
 * Just a popupSendMessage. Does not have to be a function.
 * @param {String} key is the string to the option clicked
 */
function getOption(key) {
  console.log(key);
  popupSendMessage(types.GET_OPTIONS_BACK, {
    option: key,
    fillCheckbox: this.options[key],
  });
  return;
}

/**
 * Pushes doc to documents after being added on the content script.
 * Make doc.selected into a boolean and gives it an index. Also, checks
 * if we need to add the index to the name.
 * Sends approval back to content script.
 * @param {Object} doc object with all information
 */
function addDocument(doc) {
  if (typeof doc === 'string') {
    doc = JSON.parse(doc);
  }
  doc = configureDocumentSelected(doc);
  doc.index = this.documents.length;
  if (this.options.showIndexInName === true) {
    doc.originalName = `${doc.index}. ${doc.originalName}`;
    doc.customName = `${doc.index}. ${doc.customName}`;
  }
  this.documents.push(doc);
  contentSendMessage(types.ADDED_DOCUMENT, doc);
  return;
}

/**
 * Updates document when the content script Remove button is clicked
 * If this was the last doc we set documents back to an empty array.
 * Otherwise, we remove the index of the doc and change the indexes
 * of the other docs. Then update the content script.
 * @param {Object} removedDoc object with all information
 */
function removeDocument(removedDoc) {
  if (typeof removedDoc === 'string') {
    removedDoc = JSON.parse(removedDoc);
  }
  if (this.documents.length === 1) {
    this.documents = [];
    this.numberOfSelectedDocuments = 0;
  } else {
    const index = Number(removedDoc.index);
    this.documents.splice(index, 1);
    this.documents = changeIndexesOfDocumentsAfterRemoval(
      index,
      this.documents
    );

    if (this.numberOfSelectedDocuments > 0) {
      this.numberOfSelectedDocuments -= 1;
    }
  }

  contentSendMessage(types.REMOVED_DOCUMENT, {
    removedDoc,
    newDocuments: this.documents,
  });
  return;
}

/**
 * If we have ids, we are selecting to remove documents.
 * We have to change the indexes of the other documents, update
 * our __DATA__ object, then update our content script and popup script.
 * If we arent removing documents, we wanna send back an message
 * to display an error on the popup script.
 */
function removeDocuments() {
  let {
    ids,
    startingIndex,
    newDocuments,
  } = getIdsStartingIndexNewDocumentsAfterRemoval();

  if (ids.length > 0) {
    newDocuments = changeIndexesOfDocumentsAfterRemoval(
      startingIndex,
      newDocuments
    );
    this.documents = newDocuments;
    this.numberOfSelectedDocuments = 0;
    contentSendMessage(types.REMOVED_DOCUMENTS, {
      ids,
      newDocuments: this.documents,
    });
    popupSendMessage(types.REMOVED_DOCUMENTS, this.documents);
  } else {
    popupSendMessage(types.ATTEMPTED_TO_REMOVE_DOCUMENTS, null);
  }
  return;
}

/**
 * Create data object for readability. Just the information
 * we need to send to the popup script to render our data.
 */
function renderPopup() {
  const data = {
    documents: this.documents,
    popupWidth: this.popupWidth,
  };
  popupSendMessage(types.RENDERED_POPUP, data);
  return;
}

/**
 * Change the selected status of a doc object.
 * Update the sessionStorage in the content script.
 * First popupMessage is to fill in the checkbox of the associate
 * doc. Second popupMessage is to check whether we fill the
 * selectAll checkbox.
 * @param {Object} newDoc
 */
function selectedDocument(newDoc) {
  const selectedIndex = newDoc.index;
  this.documents[selectedIndex] = newDoc;
  calculateNumberOfDocumentsSelected(newDoc);
  contentSendMessage(types.SELECTED_DOCUMENT, this.documents);
  popupSendMessage(types.SELECTED_DOCUMENT_BACK, newDoc);
  popupSendMessage(
    types.CHECKED_ALL_DOCUMENTS_SELECTED_BACK,
    this.numberOfSelectedDocuments === this.documents.length
  );
  return;
}

/**
 * Changes the doc in our documents then updates
 * the content script so we can display the custom name.
 * and the popup script so we can also display the name.
 * @param {Object} newDoc
 */
function changeDocumentName(newDoc) {
  const selectedIndex = newDoc.index;
  this.documents[selectedIndex] = newDoc;
  contentSendMessage(types.CHANGED_DOCUMENT_NAME, newDoc);
  popupSendMessage(types.CHANGED_DOCUMENT_NAME, newDoc);
  return;
}

/**
 * We clicked the selectAll checkbox on the popup script.
 * Iterate over the documents array giving the new select value.
 * Change the number of selected docs accordingly.
 * @param {Boolean} newSelect
 */
function toggleDocumentsSelect(newSelect) {
  this.documents = this.documents.map(doc => {
    return { ...doc, selected: newSelect };
  });
  if (newSelect === true) {
    this.numberOfSelectedDocuments = this.documents.length;
  } else {
    this.numberOfSelectedDocuments = 0;
  }
  popupSendMessage(types.TOGGLED_SELECT_ALL_DOCUMENTS, newSelect);
  contentSendMessage(types.TOGGLED_SELECT_ALL_DOCUMENTS, this.documents);
  return;
}

/**
 * Sends a message to the popup script determining
 * whether the select all checkbox should fill.
 */
function checkIfAllDocumentsSelected() {
  popupSendMessage(
    types.CHECKED_ALL_DOCUMENTS_SELECTED_BACK,
    __DATA__.numberOfSelectedDocuments === __DATA__.documents.length &&
      __DATA__.numberOfSelectedDocuments !== 0
  );
  return;
}

/**
 * After a document fails to download we tell the background
 * so we do not keep trying to download as we change tabs
 * on the popup script.
 * @param
 */
function setFailedToDownload(doc) {
  doc.failedToDownload = true;
  this.documents[doc.index] = doc;
  return;
}

const __DATA__ = {
  documents: [],
  popupWidth: 400,
  numberOfSelectedDocuments: 0,
  appCodeName: '',
  options: {
    saveOnRefresh: false,
    showIndexInName: false,
  },
  setData,
  toggleDocumentsSelect,
  changeDocumentName,
  selectedDocument,
  toggledOption,
  getOption,
  addDocument,
  removeDocument,
  removeDocuments,
  renderPopup,
  checkIfAllDocumentsSelected,
  setFailedToDownload,
};

export default __DATA__;
