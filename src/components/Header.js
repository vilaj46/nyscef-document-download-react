import React from 'react';

class Header extends React.Component {
  render() {
    const { activeTab, tabChange, mozillaErrorMessage } = this.props;
    return (
      <header className='header'>
        <HeaderTab
          label='Document List'
          index={0}
          activeTab={activeTab}
          tabChange={tabChange}
        />
        <HeaderTab
          label='Download'
          index={1}
          activeTab={activeTab}
          tabChange={tabChange}
          mozillaErrorMessage={mozillaErrorMessage}
        />
        <HeaderTab
          label='Options'
          index={2}
          activeTab={activeTab}
          tabChange={tabChange}
        />
      </header>
    );
  }
}

const HeaderTab = ({
  label,
  index,
  activeTab,
  tabChange,
  mozillaErrorMessage = '',
}) => {
  return (
    <div className='.headerTab'>
      <h2
        onClick={() => tabChange(index)}
        className={activeTab === index ? 'active' : 'unactive'}
        style={{ textAlign: 'center' }}
      >
        {label}
      </h2>
      {mozillaErrorMessage.length > 0 && (
        <small className='mozillaErrorMessage'>{mozillaErrorMessage}</small>
      )}
    </div>
  );
};

export default Header;
