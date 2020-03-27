import React from 'react';
import DocumentItem from './DocumentItem.js';
import types from '../types.js';
import { backgroundSendMessage } from '../messages.js';

class DocumentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: [],
    };
    this._isMounted = false;
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this.setState({ documents: [] });
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (this._isMounted) {
        switch (message.action) {
          case types.GET_DOCUMENTS_BACK:
            return this.setState({ documents: message.payload });
          case types.REMOVED_DOCUMENTS:
            return this.setState({ documents: message.payload });
          case types.ADDED_INDEXES_TO_NAME:
            return this.setState({ documents: message.payload });
          case types.REMOVED_INDEXES_FROM_NAME:
            return this.setState({ documents: message.payload });
          default:
            return;
        }
      }
      return;
    });
    backgroundSendMessage(types.GET_DOCUMENTS);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { documents } = this.state;
    return (
      <ul className='documentList'>
        {documents.map(doc => {
          return <DocumentItem doc={doc} key={doc.id} index={doc.index} />;
        })}
      </ul>
    );
  }
}

export default DocumentList;
