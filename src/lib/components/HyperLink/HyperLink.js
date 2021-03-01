
import React from 'react';
import PropTypes from 'prop-types';
/**
 * 
 * @param {object} props 
 * To provide more context on the various layer groupings on the menu
 * This component is responsible for rendering links and description icons
 * on the menu
 */
export const HyperLink = (props) => {

  const { link, description, spanClassName, descriptionStyle } = props;
  return (
    link || description ?
    <span className={spanClassName ? spanClassName : "links"}>
      {link ? (
        <a href={link} target="_blank" className="glyphicon glyphicon-list-alt hyperlink"></a>
      ) : null}
      {description ? (
        <div className="description" style={descriptionStyle}>
          <span className="glyphicon glyphicon-info-sign" />
          <p>{description}</p>
        </div>
      ) : (
        ''
      )}
    </span> : null
  );
};
HyperLink.propTypes = {
    link: PropTypes.string,
    description: PropTypes.string,
    spanClassName: PropTypes.string,
    descriptionStyle: PropTypes.string
};
