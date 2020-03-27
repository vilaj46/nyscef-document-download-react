/* eslint-disable no-undef */
export const contentSendMessage = (action = '', payload = null) => {
  chrome.tabs.query({ active: true }, tabs => {
    const { id } = tabs[0];
    chrome.tabs.sendMessage(id, {
      action,
      payload,
    });
  });
};

export const popupSendMessage = (action = '', payload = null) => {
  chrome.runtime.sendMessage({
    action,
    payload,
  });
};

export const backgroundSendMessage = (action = '', payload = null) => {
  chrome.runtime.sendMessage({
    action,
    payload,
  });
};
