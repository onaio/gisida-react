import React from 'react';
import { useToasts } from 'react-toast-notifications';
/**
 * Component handles sharing site instances by copying parmeterized url to clipboard
 */
const Share = () => {
    const { addToast } = useToasts();
    const onCopyToClipBoard = () => {
        /**
         * Unfortunately there is no standard API for clipboard operations,
         * so we're left with the hacky way of using a HTML input element to fit our needs
         */
        const el = document.createElement('input');
        el.value = window.location.href;
        el.id = "url-input";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        el.remove();
        addToast('Link copied to clipboard', { appearance: 'success', autoDismiss: true, autoDismissTimeout: 2000 });
    };

    return (<div>
        <li>
            <a href="#" onClick={() => onCopyToClipBoard()}>
                <span className="glyphicon glyphicon-share" />
            </a>
        </li>
    </div>);
}


export default Share;