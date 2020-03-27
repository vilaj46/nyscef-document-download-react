import React from 'react';
import { backgroundSendMessage } from '../messages.js';
import types from '../types.js';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: {},
      cla$$: 'white',
      mounted: false,
      pop: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.clickDownloadObject = this.clickDownloadObject.bind(this);
    this.removeDocument = this.removeDocument.bind(this);
    this.getDocumentBlob = this.getDocumentBlob.bind(this);
    this.downloadDocument = this.downloadDocument.bind(this);
    this.retryDocumentDownload = this.retryDocumentDownload.bind(this);
  }

  componentDidMount() {
    const { doc } = this.props;
    const url = doc.id;
    this.setState({ doc, mounted: true });
    if (!doc.failedToDownload) {
      this.downloadDocument(url);
    } else {
      this.setState({ cla$$: 'fail' });
      return;
    }
  }

  downloadDocument(givenUrl = '', retry = false) {
    const { doc } = this.props;
    const url = givenUrl.length > 0 ? givenUrl : doc.id;
    this.getDocumentBlob(url)
      .then(blob => {
        this.clickDownloadObject(blob);
        this.removeDocument();
      })
      .catch(err => {
        this.setState({ cla$$: 'fail' });
        backgroundSendMessage(types.DOCUMENT_FAILED_DOWNLOAD, doc);
        if (retry === true) {
          this.setState({ pop: true });

          setTimeout(() => {
            this.setState({ pop: false });
          }, 500);
        }
      });
  }

  getDocumentBlob(url) {
    const { doc } = this.props;
    return fetch(url, { mode: 'no-cors' }).then(res => {
      if (
        res.status === 404 ||
        res.url.includes('nyscef/Login') ||
        res.status === 400
      ) {
        this.setState({ cla$$: 'fail' });
        backgroundSendMessage(types.DOCUMENT_FAILED_DOWNLOAD, doc);
        return {};
      }
      this.setState({ cla$$: 'success' });
      return res.blob();
    });
  }

  clickDownloadObject(blob) {
    const { doc } = this.props;
    const { customName } = doc;
    const blobURL = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobURL;
    a.download = `${customName}.pdf`;
    document.body.appendChild(a);
    // const button = document.getElementById(id);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobURL);
  }

  removeDocument() {
    const { doc } = this.props;
    backgroundSendMessage(types.REMOVED_DOCUMENT, doc);
    this.setState({ mounted: false });
  }

  retryDocumentDownload() {
    this.downloadDocument(
      'https://iapps.courts.state.ny.us/nyscef/ViewDocume%E2%80%A6cIndex=L9aq6qM5_PLUS_G/NoyIXNxKoeQ==1aaaaaaaaaaaa',
      true
    );
  }

  render() {
    const { cla$$, mounted, pop } = this.state;
    const { tabChange, doc } = this.props;
    return (
      mounted && (
        <React.Fragment>
          {cla$$ === 'fail' && (
            <div className='tabButtons'>
              <button
                type='text'
                className='tabButton retry'
                onClick={this.retryDocumentDownload}
              >
                Retry
              </button>
              <button
                type='text'
                className={`tabButton remove ${pop === true ? 'pop' : ''}`}
                onClick={this.removeDocument}
              >
                Remove
              </button>
            </div>
          )}
          <div className='progress'>
            <div className={`bar ${cla$$} `} style={{ width: '100%' }}>
              <p className='percent'>{doc.customName}</p>
              <div className='arrowRight' onClick={() => tabChange(3, doc)} />
            </div>
          </div>
        </React.Fragment>
      )
    );
  }
}

export default ProgressBar;
