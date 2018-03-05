import React, { Component } from 'react';
import { Actions } from 'gisida';
import { connect } from 'react-redux';
import './DetailView.scss';

const mapStateToProps = (state, ownProps) => {
  const { detailView } = state.MAP;
  const layerObj = (detailView && detailView.layerId)
    ? state.MAP.layers[detailView.layerId] : null;
  return {
    MAP: state.MAP,
    layerObj,
    properties: detailView && detailView.properties,
    spec: layerObj && layerObj['detail-view'], 
  };
}

class DetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillReceiveProps(nextProps) {
    const { layerObj, properties, spec } = nextProps;
    if (!layerObj || !spec || !properties) {
      this.setState({ UID: null });
    } else {
      this.setState({
        UID: properties[spec.UID],
        title: properties[spec.title.prop],
        subTitle: properties[spec['sub-title'].prop],
      });
    }
  }

  onCloseClick(e) {
    e.preventDefault();
    this.props.dispatch(Actions.detailView(null));
  }

  render() {
    const { UID, title, subTitle } = this.state;
    if (this.props.MAP.showFilterPanel || !UID) return null;

    return (
      <div className="detail-view-wrapper">
        <a
          className="close-btn"
          title="Close profile view"
          onClick={e => this.onCloseClick(e)}
          href="/detail-view"
        >
          <span className="glyphicon glyphicon-remove" />
        </a>

        <div className="detail-basic-details">
          <div className="detail-header">
            <h4>{title}</h4>
            {!!subTitle ? (<h6>{subTitle}</h6>) : ''}
          </div>
          <div className="detail-list">
            <ul></ul>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DetailView);
