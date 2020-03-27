import React from 'react';
import Trash from './Trash.js';
import types from '../types.js';
import { backgroundSendMessage } from '../messages.js';

class DocumentListHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fillCheckbox: false,
      error: '',
    };
    this._isMounted = false;
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.shouldFillSelectAllCheckbox = this.shouldFillSelectAllCheckbox.bind(
      this
    );
    this.displayErrorMessage = this.displayErrorMessage.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    backgroundSendMessage(types.CHECKED_ALL_DOCUMENTS_SELECTED);
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // CHECKED_ALL_DOCUMENTS_SELECTED was being triggered even though
      // message.action was undefined. This will prevent a state change
      // when the component is unmounted.
      if (message.action === undefined && this._isMounted === true) {
        return;
      } else {
        switch (message.action) {
          case types.CHECKED_ALL_DOCUMENTS_SELECTED_BACK:
            return this.shouldFillSelectAllCheckbox(message.payload);
          case types.REMOVED_DOCUMENTS:
            return this.setState({ fillCheckbox: false });
          case types.TOGGLED_SELECT_ALL_DOCUMENTS:
            return this.setState({ fillCheckbox: message.payload });
          default:
            return;
        }
      }
    });
  }

  toggleCheckbox() {
    const documentList = document.querySelector('.documentList');
    if (documentList.children.length === 0) {
      this.setState({ error: 'Add documents to the list first!' });
    } else {
      const { fillCheckbox } = this.state;
      const newFillCheckbox = !fillCheckbox;
      backgroundSendMessage(
        types.TOGGLED_SELECT_ALL_DOCUMENTS,
        newFillCheckbox
      );
      this.setState({ error: '' });
    }
  }

  displayErrorMessage(error) {
    this.setState({ error });
  }

  shouldFillSelectAllCheckbox(shouldWeFillCheckbox) {
    if (shouldWeFillCheckbox === true) {
      this.setState({ fillCheckbox: true });
    } else {
      this.setState({ fillCheckbox: false });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { fillCheckbox, error } = this.state;
    return (
      <div>
        {error !== '' && <InlineErrorMessage error={error} />}
        <li className='dropdownContainer dropdown'>
          <Trash displayErrorMessage={this.displayErrorMessage} />
          <div className='arrowDown'></div>
          <div
            className={`checkbox ${fillCheckbox ? 'checkboxFill' : ''}`}
            onClick={this.toggleCheckbox}
          ></div>
        </li>
      </div>
    );
  }
}

const InlineErrorMessage = ({ error }) => (
  <p className='topErrorMessage'>{error}</p>
);

export default DocumentListHeader;
