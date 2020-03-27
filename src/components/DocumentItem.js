import React from 'react';
import types from '../types.js';
import { backgroundSendMessage } from '../messages.js';

class DocumentItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: {},
      loaded: false,
    };
    this._isMounted = false;
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.onChange = this.onChange.bind(this);
    this.changeStateOnMessage = this.changeStateOnMessage.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    const { doc } = this.props;
    let checkedDoc = { ...doc };
    if (doc.customName === '') {
      checkedDoc.customName = checkedDoc.originalName;
    }
    this.setState({ doc: checkedDoc, loaded: true });
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (this._isMounted === true) {
        switch (message.action) {
          case types.SELECTED_DOCUMENT_BACK:
            return this.changeStateOnMessage(message.payload);
          case types.CHANGED_DOCUMENT_NAME:
            return this.changeStateOnMessage(message.payload);
          case types.TOGGLED_SELECT_ALL_DOCUMENTS:
            return this.setState({
              doc: { ...this.state.doc, selected: message.payload },
            });
          default:
            return;
        }
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const stateDoc = this.state.doc;
    const propsDoc = this.props.doc;
    if (stateDoc.index !== propsDoc.index) {
      this.setState({
        doc: {
          ...stateDoc,
          index: propsDoc.index,
          customName: propsDoc.customName,
          originalName: propsDoc.originalName,
        },
      });
    }
  }

  changeStateOnMessage(newDoc) {
    const { doc } = this.state;
    if (newDoc.id === doc.id) {
      this.setState({ doc: newDoc });
    }
  }

  toggleCheckbox() {
    const { doc } = this.state;
    const newDoc = { ...doc, selected: !doc.selected };
    backgroundSendMessage(types.SELECTED_DOCUMENT, newDoc);
  }

  onChange(e) {
    const { doc } = this.state;
    const newDoc = { ...doc, customName: e.target.value };
    backgroundSendMessage(types.CHANGED_DOCUMENT_NAME, newDoc);
  }

  render() {
    const { doc, loaded } = this.state;
    return (
      loaded && (
        <li className='documentItem'>
          <input
            type='text'
            name='name'
            value={doc.customName}
            onChange={this.onChange}
          />
          <div
            className={`checkbox centerCheckbox ${
              doc.selected === true ? 'checkboxFill' : ''
            }`}
            onClick={this.toggleCheckbox}
          ></div>
        </li>
      )
    );
  }
}

export default DocumentItem;
