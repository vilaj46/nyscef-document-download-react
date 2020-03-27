import __DATA__ from './backgroundData.js';
import types from '../../types.js';
import { contentSendMessage } from '../../messages.js';

/**
 * When documents are added, booleans are sent as strings.
 * We convert the strings into actual booleans.
 * @param {Object} Doc object
 * @return {Object} Doc object with new select status
 */
export const configureDocumentSelected = doc => {
  if (doc.selected === 'true') {
    doc.selected = true;
  } else {
    doc.selected = false;
  }
  return doc;
};

/**
 * Takes the status of the selected document and
 * adds or subtracts depending on the status then updates
 * the __DATA__ object.
 * @param {Object} New Doc and its status
 */
export const calculateNumberOfDocumentsSelected = newDoc => {
  if (newDoc.selected === true) {
    __DATA__.numberOfSelectedDocuments += 1;
  } else {
    __DATA__.numberOfSelectedDocuments -= 1;
  }
  return;
};

/**
 * Iterate over the documents array to get the ids
 * that are to be removed so we can change the buttons text. We
 * also find the starting index of the first selection so we change everything
 * after that reducing the iteration when changing rearranging indexes.
 * @return {Object} Return the starting index of changes, array of ids, documents after removal.
 */
export const getIdsStartingIndexNewDocumentsAfterRemoval = () => {
  let ids = [];
  let startingIndex = 0;
  const newDocuments = __DATA__.documents.filter((doc, currentIndex) => {
    // Gets the starting index for the change indexes function.
    if (doc.selected === true && startingIndex === null) {
      startingIndex = currentIndex;
    }
    // Need the ideas to change the buttons in the content script.
    if (doc.selected === true) {
      ids.push(doc.id);
    }
    // We will replace the localStorage with these new documents.
    if (doc.selected === false) {
      return true;
    } else {
      return false;
    }
  });
  return { startingIndex, ids, newDocuments };
};

/**
 * Given the index of the first deleted document,
 * we update the rest of the documents with their
 * new position in the array.
 * @param {Number} deletedIndex
 * @param {Array} documents
 * @return {Array} tempDocuments
 */
export const changeIndexesOfDocumentsAfterRemoval = (
  deletedIndex,
  documents
) => {
  const tempDocuments = documents.map((doc, currentIndex) => {
    if (currentIndex >= deletedIndex) {
      const originalName = changeNameToNewIndex(
        doc.originalName,
        doc.index,
        currentIndex
      );
      const customName = changeNameToNewIndex(
        doc.customName,
        doc.index,
        currentIndex
      );
      const newDoc = { ...doc, index: currentIndex, originalName, customName };
      contentSendMessage(types.UPDATED_DOCUMENT_INDEX, newDoc);
      return newDoc;
    } else {
      return doc;
    }
  });
  return tempDocuments;
};

/**
 * Iterates over the documents and returns new documents
 * with customName and originalName indexed.
 * @param {Array} documents
 * @return {Array} update documents
 */
export const addIndexesToName = documents => {
  return documents.map(doc => {
    const isIndexInName = doc.originalName.includes(`${doc.index}.`);
    return {
      ...doc,
      originalName: !isIndexInName
        ? `${doc.index}. ${doc.originalName}`
        : doc.originalName,
      customName: !isIndexInName
        ? `${doc.index}. ${doc.customName}`
        : doc.customName,
    };
  });
};

/**
 * After documents are removed, we have to change
 * the text of the originalName and customName.
 * @param {String} name
 * @param {Number} oldIndex
 * @param {Number} newIndex
 * @return {String} new name
 */
const changeNameToNewIndex = (name, oldIndex, newIndex) => {
  const hasIndex = name.includes(`${oldIndex}. `);
  if (hasIndex === true) {
    const indexOfIndex = name.indexOf(`${oldIndex}. `);
    let tempName = name.slice(indexOfIndex + 2, name.length);
    tempName = `${newIndex}. ` + tempName.trim();
    return tempName;
  } else {
    return name;
  }
};

/**
 * Removes index from every document in the list
 * @param {Array} array of documents with indexes in name
 * @return {Array} array of documents with no indexes in name
 */
export const removeIndexesFromName = documents => {
  return documents.map(doc => {
    return {
      ...doc,
      originalName: sliceIndexFromName(doc, 'originalName'),
      customName: sliceIndexFromName(doc, 'customName'),
    };
  });
};

/**
 * Finds the index of the index format and removes it from the
 * string.
 * @param {Object} doc object
 * @param {String} key which we are changing
 * @return {String} key without index
 */
const sliceIndexFromName = (doc, key) => {
  // format is {index}._
  const indexLength = String(doc.index).length;
  const indexOfIndex = doc[key].indexOf(`${doc.index}. `);
  if (indexOfIndex !== -1) {
    return doc[key].slice(indexOfIndex + Number(indexLength) + 2);
  }
  return;
};
