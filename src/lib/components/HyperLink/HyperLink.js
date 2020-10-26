
import React from 'react';
import './HyperLink.scss';
import PropTypes from 'prop-types';

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
