import React from 'react';
import Header from './Header.js';
import DocumentList from './DocumentList.js';
import DocumentListHeader from './DocumentListHeader.js';
import DownloadButton from './DownloadButton.js';
import Options from './Options.js';
import DownloadTab from './DownloadTab.js';
import types from '../types.js';
import { backgroundSendMessage } from '../messages.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      activeTab: 0,
      documentTabData: {},
      mozillaErrorMessage: '',
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.tabChange = this.tabChange.bind(this);
  }

  componentDidMount() {
    const { popupWidth } = this.props.data;
    document.getElementById('root').style.width = `${popupWidth}px`;
    this.setState({ loaded: true });
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === types.GET_APP_CODE_NAME_BACK) {
        if (!message.payload.includes('Google')) {
          console.log(message.payload);
          this.setState({
            mozillaErrorMessage: 'Make sure PDF files are saved on disk.',
          });
        } else {
          this.setState({ mozillaErrorMessage: '' });
        }
      }
    });
    backgroundSendMessage(types.GET_APP_CODE_NAME);
  }

  tabChange(tab = 0, data = {}) {
    this.setState({ activeTab: tab, documentTabData: data });
  }

  render() {
    const {
      loaded,
      activeTab,
      documentTabData,
      mozillaErrorMessage,
    } = this.state;
    const { popupWidth } = this.props.data;
    return (
      loaded && (
        <React.Fragment>
          <Header
            activeTab={activeTab}
            tabChange={this.tabChange}
            mozillaErrorMessage={mozillaErrorMessage}
          />
          {activeTab === 0 && <DocumentListHeader />}
          {activeTab === 0 && (
            <DocumentList documents={this.props.data.documents} />
          )}
          {activeTab === 0 && <DownloadButton tabChange={this.tabChange} />}
          {activeTab === 1 && <DownloadTab tabChange={this.tabChange} />}
          {activeTab === 2 && <Options />}
          {activeTab === 3 && (
            <DocumentTab
              data={documentTabData}
              width={popupWidth}
              tabChange={this.tabChange}
            />
          )}
        </React.Fragment>
      )
    );
  }
}

const DocumentTab = ({ data, width, tabChange }) => {
  return (
    <React.Fragment>
      <button type='text' onClick={() => tabChange(1)}>
        GO BACK
      </button>
      <iframe src={data.id} width={width} height='500' title={data.id}></iframe>
    </React.Fragment>
  );
};

export default App;
