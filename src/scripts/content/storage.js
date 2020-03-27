import types from '../../types.js';
import { sliceIndexFromOriginalName } from './contentUtils.js';

/**
 * Gets the docket it so we can eventually switch pages and keep our documents
 * @return {String}      The total of the two numbers
 */
const getDocketId = () => {
  const { search } = window.location;
  // Format : "?docketId=PUHQCgtFQNFgrosnjH5RWQ==&display=L9aq6qM5_PLUS_G/NoyIXNxKoeQ=="
  const firstEqualSign = search.indexOf('=');
  const equalSignPlus = search.slice(firstEqualSign + 1, search.length);
  const secondEqualSign = equalSignPlus.indexOf('=');
  return equalSignPlus.slice(0, secondEqualSign);
};

/**
 * Checks if document selected is true on initial load.
 * If its not, the background script will set it to false.
 * This also will change the button dataset.
 * @param  {Object} From the session storage
 * @param  {<button></button>} Button
 * @return {<button></button>} Button after dataset change
 */
const setButtonSelectedAttribute = (doc, button) => {
  if (doc.selected === true) {
    button.setAttribute('data-selected', 'true');
  }
  return button;
};

/**
 * Updates button dataset customName
 * @param  {Object} From the session storage
 * @param  {<button></button>} Button
 * @return {<button></button>} Button after dataset change
 */
const setButtonCustomNameAttribute = (doc, button) => {
  const { customName, originalName } = doc;
  if (customName !== originalName && customName.length > 0) {
    const parent = button.parentElement;
    const anchor = parent.querySelector('a');
    const originalNameWithoutIndex = sliceIndexFromOriginalName(doc);
    const newName = `${originalNameWithoutIndex} (${customName})`;
    anchor.innerText = newName;
    button.setAttribute('data-custom-name', customName);
  }
  return button;
};

/**
 * On a content script refresh we just reset all the data to our set
 * default values.
 * @param {Object} backgroundData containing the documents and options
 */
const setStorageToDefaultValues = backgroundData => {
  const docketId = getDocketId();
  const { documents, options } = backgroundData;
  sessionStorage.setItem('docketId', docketId);
  sessionStorage.setItem('documents', '[]');
  sessionStorage.setItem('options', JSON.stringify(options));
  return;
};

/**
 * On a content script refresh we just set all the data to our
 * sessionStorage and update the buttons.
 * @param {Object} backgroundData containing the documents and options
 */
const setStorageToPreviousData = backgroundData => {
  const { documents, options } = backgroundData;
  sessionStorage.setItem('documents', JSON.stringify(documents));
  sessionStorage.setItem('options', JSON.stringify(options));
  documents.forEach((doc, index) => {
    let button = document.getElementById(doc.id);
    button = setButtonSelectedAttribute(doc, button);
    button = setButtonCustomNameAttribute(doc, button);
    button.setAttribute('data-index', index);
    button.innerText = 'Remove';
  });
  return;
};

/**
 * Checks if our previous docket id is the same as the current one.
 * If they are the same keep the data, if they are different keep
 * the options but remove the document list.
 * @param  {Object} From the session storage
 * @param  {<button></button>} Button
 * @return {<button></button>} Button after dataset change
 */
const initialize = (currentDocketId, backgroundData) => {
  const previousDocketId = sessionStorage.getItem('docketId');
  if (currentDocketId !== null && previousDocketId === currentDocketId) {
    setStorageToPreviousData(backgroundData);
  } else {
    setStorageToDefaultValues(backgroundData);
  }
  return;
};

/**
 * Pushes new documents into the sessionStorage documents item.
 * @param  {Object} a document object from the background script
 */
const addDocument = doc => {
  let documents = JSON.parse(sessionStorage.getItem('documents'));
  documents.push(doc);
  sessionStorage.setItem('documents', JSON.stringify(documents));
  return;
};

/**
 * Updates documents with new documents. Used when we remove documents or select
 * documents.
 * @param  {Array} Array of new documents
 */
const replaceDocuments = newDocuments => {
  sessionStorage.setItem('documents', JSON.stringify(newDocuments));
  return;
};

/**
 * Updates the custom name of the changed document.
 * @param  {Object} A document object
 */
const changeDocumentName = newDoc => {
  const documents = JSON.parse(sessionStorage.getItem('documents'));
  const changedDocumentIndex = newDoc.index;
  documents[changedDocumentIndex] = newDoc;
  sessionStorage.setItem('documents', JSON.stringify(documents));
  return;
};

/**
 * Updates options after background script makes the change which
 * is triggered by the popup script.
 * @param  {Object} New Options
 */
const replaceOptions = newOptions => {
  sessionStorage.setItem('options', JSON.stringify(newOptions));
};

/**
 * customName, originalName, index properties have been
 * updated after the removal of documents.
 * @param {Object} newDoc
 */
const updateDocumentIndex = newDoc => {
  let documents = JSON.parse(sessionStorage.getItem('documents'));
  documents[newDoc.index] = newDoc;
  sessionStorage.setItem('documents', JSON.stringify(documents));
  return;
};

export default {
  docketId: getDocketId(),
  getDocketId,
  initialize,
  addDocument,
  replaceDocuments,
  changeDocumentName,
  replaceOptions,
  updateDocumentIndex,
};
