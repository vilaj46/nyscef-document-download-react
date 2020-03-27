import React from 'react';
import { backgroundSendMessage } from '../messages.js';
import types from '../types.js';

class Options extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Option text='Show index in name' backgroundKey='showIndexInName' />
        <Option text='Save on refresh' backgroundKey='saveOnRefresh' />
      </React.Fragment>
    );
  }
}

class Option extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fillCheckbox: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
  }

  componentDidMount() {
    const { backgroundKey } = this.props;
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { option, fillCheckbox } = message.payload;
      console.log(message);
      if (
        message.action === types.TOGGLED_OPTIONS_BACK &&
        option === backgroundKey
      ) {
        this.setState({ fillCheckbox });
      }

      if (
        message.action === types.GET_OPTIONS_BACK &&
        message.payload.option === backgroundKey
      ) {
        this.setState({ fillCheckbox });
      }
    });
    backgroundSendMessage(types.GET_OPTIONS, backgroundKey);
  }

  toggleCheckbox() {
    const { backgroundKey } = this.props;
    backgroundSendMessage(types.TOGGLED_OPTIONS, backgroundKey);
  }

  render() {
    const { text } = this.props;
    const { fillCheckbox } = this.state;
    return (
      <React.Fragment>
        <p>{text}</p>
        <div
          onClick={this.toggleCheckbox}
          className={`checkbox ${fillCheckbox ? 'checkboxFill' : ''}`}
        ></div>
      </React.Fragment>
    );
  }
}

export default Options;
