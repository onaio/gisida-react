import React from 'react';
/**
 * Component handles sharing site instances by copying parmeterized url to clipboard
 */
const Share = () => {
  const onCopyToClipBoard = () => {
    /**
     * Unfortunately there is no standard API for clipboard operations,
     * so we're left with the hacky way of using a HTML input element to fit our needs
     */
    const el = document.createElement('input');
    el.value = window.location.href;
    el.id = 'url-input';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
    console.log('Lets make a toast');
    alert('Linked copied');
  };

  return (
    <div>
      <li>
        <a href="#" title='Share' alt='Share'  onClick={() => onCopyToClipBoard()}>
          <span className="glyphicon glyphicon-share" />
        </a>
      </li>
    </div>
  );
};

export default Share;
