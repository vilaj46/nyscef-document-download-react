import React from 'react';
import types from '../types.js';

class DownloadButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
    };
    this._isMounted = false;
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (
        message.action === types.REMOVED_DOCUMENTS ||
        (message.action === types.GET_DOCUMENTS_BACK &&
          this._isMounted === true)
      ) {
        const documentList = document.querySelector('.documentList');
        if (documentList.children.length <= 9) {
          this.setState({ display: false });
        } else {
          this.setState({ display: true });
        }
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { display } = this.state;
    const { tabChange } = this.props;
    return (
      <li style={{ display: `${display ? 'flex' : 'none'}` }}>
        <h2 className='downloadButton' onClick={() => tabChange(1)}>
          Download
        </h2>
      </li>
    );
  }
}

export default DownloadButton;
