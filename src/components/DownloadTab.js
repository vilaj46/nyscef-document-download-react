import React from 'react';
import { backgroundSendMessage } from '../messages.js';
import types from '../types.js';
import ProgressBar from './ProgressBar.js';

class DownloadTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: [],
    };
    this._isMounted = false;
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (this._isMounted === true) {
        switch (message.action) {
          case types.GET_DOCUMENTS_BACK:
            return this.setState({ documents: message.payload });
          default:
            return;
        }
      }
    });
    backgroundSendMessage(types.GET_DOCUMENTS);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { documents } = this.state;
    const { tabChange } = this.props;
    return (
      <ul className='documentList'>
        {documents.map(doc => {
          return <ProgressBar doc={doc} key={doc.id} tabChange={tabChange} />;
        })}
      </ul>
    );
  }
}

export default DownloadTab;
