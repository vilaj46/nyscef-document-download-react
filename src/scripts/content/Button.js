import types from '../../types.js';
import { backgroundSendMessage } from './contentUtils.js';

/**
 * Creates a button and setups dataset information.
 * @param  {String} id which is just the href that we use as an id
 * @param  {String} Custom name which could have been altered
 * @param  {String} Original name which was not altered but we keep as a fallback
 * @return {<button></button>} Element with all the information set except index and selected.
 */
const Button = ({ id, customName, originalName }) => {
  const element = document.createElement('button');
  element.type = 'text';
  element.innerText = 'Add';
  element.setAttribute('id', id);
  element.setAttribute('data-id', id);
  element.setAttribute('data-custom-name', customName);
  element.setAttribute('data-original-name', originalName);
  element.addEventListener('click', event => onClick(event, element.dataset));
  return element;
};

/**
 * Sends a background message whether we are adding or removing the document
 * @param  {Object} Buttons event object
 * @param  {Object} Buttons dataset which includes the document information
 */
const onClick = (event, dataset) => {
  event.preventDefault();
  if (event.target.innerText === 'Add') {
    backgroundSendMessage(types.ADDED_DOCUMENT, JSON.stringify(dataset));
  } else {
    backgroundSendMessage(types.REMOVED_DOCUMENT, JSON.stringify(dataset));
  }
  return;
};

export default Button;
