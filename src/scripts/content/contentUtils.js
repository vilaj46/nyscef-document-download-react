/* eslint-disable no-undef */
import Button from './Button.js';

/**
 * Calculates the width of the popup extension. If it was over 1600,
 * the popup script had horizontal scroll.
 */
export const calculateWidthOfPopup = () => {
  const contentPageWidth = document.querySelector('body').offsetWidth;
  if (contentPageWidth >= 1600) {
    return 750;
  } else {
    return contentPageWidth / 2;
  }
};

/**
 * Sends message to background script.
 * @param {Object} action
 * @param {Any} payload
 */
export const backgroundSendMessage = (action = {}, payload = null) => {
  return chrome.runtime.sendMessage({
    action,
    payload,
  });
};

/**
 * Traverses the DOM looking for anchor elements.
 * Separates the elements by having 'ViewDocument' in the href.
 * @return {Array} Array of <a> elements
 */
export const getViewDocumentAnchorElements = () => {
  const allLinks = document.querySelectorAll('a');
  const viewDocumentLinks = Array.from(allLinks).filter(link => {
    if (link.href.includes('ViewDocument')) {
      return true;
    } else {
      return false;
    }
  });
  return viewDocumentLinks;
};

/**
 * Uses the view documents anchor elements and traverses
 * over them adding the necessary information and appending
 * the button.
 */
export const appendButtonsToPage = () => {
  const viewDocuments = getViewDocumentAnchorElements();
  viewDocuments.forEach((viewDocument, index) => {
    const parent = viewDocument.parentElement;
    const data = {
      id: viewDocument.href,
      customName: viewDocument.innerText,
      originalName: viewDocument.innerText,
    };
    const button = Button(data);
    parent.append(button);
  });
  return;
};

/**
 * AFter removing documents the index of the buttons / associates documents
 * will be off. Iterate over the the new documents and update the indexes.
 * @param  {Array of objects}
 */
export const rearrangeButtonDataSetIndex = newDocuments => {
  newDocuments.forEach(newDoc => {
    const button = document.getElementById(newDoc.id);
    button.setAttribute('data-index', newDoc.index);
  });
  return;
};

/**
 * Take out the index because we don't want to display it on the content page
 * or keep the originalName because there is no index.
 * @param {Object} newDoc
 * @return {String} originalName
 */
export const sliceIndexFromOriginalName = newDoc => {
  // format is {index}._
  const indexLength = String(newDoc.index).length;
  const indexOfIndex = newDoc.originalName.indexOf(`${newDoc.index}. `);
  if (indexOfIndex !== -1) {
    return newDoc.originalName.slice(indexOfIndex + Number(indexLength) + 2);
  }
  return newDoc.originalName;
};
