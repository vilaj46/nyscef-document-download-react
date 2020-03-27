import storage from './storage.js';
import {
  appendButtonsToPage,
  rearrangeButtonDataSetIndex,
  sliceIndexFromOriginalName,
} from './contentUtils.js';

/**
 * Adds buttons to the page. After that we check if
 * we will be using the sessionStorage data based on our popup options.
 * @param  {Object} Background data which includes documents and options
 */
const setData = backgroundData => {
  appendButtonsToPage();
  if (backgroundData.options.saveOnRefresh === false) {
    sessionStorage.clear();
    storage.initialize(storage.getDocketId(), backgroundData);
  } else {
    storage.initialize(storage.getDocketId(), backgroundData);
  }
  return;
};

/**
 * Background scripts response after an Add button click.
 * Selects the button and changes the text to Remove and
 * adds the index into the dataset. Also, updates
 * the sessionStorage.
 * @param  {Object} doc object which contains all the document information.
 */
const addedDocument = doc => {
  const { id } = doc;
  const button = document.getElementById(id);
  button.innerText = 'Remove';
  button.setAttribute('data-index', doc.index);
  storage.addDocument(doc);
  return;
};

/**
 * Background scripts response after an Remove button click.
 * Selects the button and changes the text to Add and rearranges the indexes.
 * Also, updates the sessionStorage with the new documents.
 * @param  {Object} removedDoc, we need the id to select the button
 * @param  {Array}  New Documents with the removed document already out. Done in the background script.
 */
const removedDocument = ({ removedDoc, newDocuments }) => {
  const button = document.getElementById(removedDoc.id);
  button.innerText = 'Add';
  rearrangeButtonDataSetIndex(newDocuments);
  storage.replaceDocuments(newDocuments);
  return;
};

/**
 * Change the text of the documents we removed from clicking the trash bin.
 * Fix the indexes of the button datasets and update our storage.
 * @param  {Array} Ids of the removed document. Will be used to change text of the button.
 * @param  {Array} New Documents with the removed already out. Work done in the background script
 */
const removedDocuments = ({ ids, newDocuments }) => {
  ids.forEach(id => {
    const button = document.getElementById(id);
    button.innerText = 'Add';
  });
  rearrangeButtonDataSetIndex(newDocuments);
  storage.replaceDocuments(newDocuments);
  return;
};

/**
 * Document name is changed in the popup script.
 * Once the background script updates the documents, the new document is sent here.
 * Select the parent of our changed button / associated document and
 * add the custom name to the end of the original name.
 * If we just delete the custom name, we just show the original name only. Then update the storage.
 * @param  {Object} the update document object, with the current custom name.
 */
const changedDocumentName = newDoc => {
  const button = document.getElementById(newDoc.id);
  const parent = button.parentElement;
  const anchor = parent.querySelector('a');
  const { customName, originalName } = newDoc;
  const originalNameWithoutIndex = sliceIndexFromOriginalName(newDoc);
  if (customName.length > 0) {
    anchor.innerText = `${originalNameWithoutIndex} (${customName})`;
    storage.changeDocumentName(newDoc);
  } else {
    anchor.innerText = originalNameWithoutIndex;
    storage.changeDocumentName({
      ...newDoc,
      customName: originalNameWithoutIndex,
    });
  }
  return;
};

/**
 * Update the index / customName / originalName of the parent
 * elements text
 * @param {Object} newDoc
 */
const updateDocumentName = newDoc => {
  const button = document.getElementById(newDoc.id);
  const parent = button.parentElement;
  const anchor = parent.querySelector('a');
  const { customName, originalName } = newDoc;
  if (customName !== originalName) {
    const originalNameWithoutIndex = sliceIndexFromOriginalName(newDoc);
    anchor.innerText = `${originalNameWithoutIndex} (${customName})`;
    storage.updateDocumentIndex(newDoc);
  }
  return;
};

export default {
  changedDocumentName,
  removedDocuments,
  removedDocument,
  addedDocument,
  setData,
  updateDocumentName,
};
