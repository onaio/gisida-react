import React, { Component } from 'react';
import { buildDetailView } from 'gisida';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import './DetailView.scss';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || {};
  const { detailView } = MAP;
  const layerObj = (detailView && detailView.layerId)
    ? MAP.layers[detailView.layerId] : null;
  return {
    APP: state.APP,
    MAP: MAP,
    mapId: ownProps.mapId,
    isSplitScreen: state.VIEW && state.VIEW.splitScreen,
    layerObj,
    detailView: detailView && detailView.model,
    properties: detailView && detailView.properties,
    spec: detailView && detailView.spec,
    children: ownProps.children,
  };
}

class DetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showImageModal: false,
    };
  }

  onFacilityImageClick(e) {
    e.preventDefault();
    this.setState({
      showImageModal: true
    });
  }

  closeImageModal(e) {
    e.preventDefault();
    this.setState({
      showImageModal: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { layerObj, properties, spec, detailView } = nextProps;
    if (!layerObj || !spec || !properties || !detailView) {
      this.setState({ UID: null });
    } else {
      const { UID, title, subTitle, basicInfo, parsedBasicInfo } = detailView;
      this.setState({
        UID,
        title,
        subTitle,
        parsedBasicInfo,
        spec,
        properties,
        basicInfo,
        layerObj,
      });
    }
  }

  onCloseClick(e) {
    e.preventDefault();
    window.maps[0].easeTo({
      center: {
        lng: this.props.APP.mapConfig.center[0],
        lat: this.props.APP.mapConfig.center[1],
      },
      zoom: this.props.APP.mapConfig.zoom,
    });
    buildDetailView(this.props.mapId, null, null, this.props.dispatch);
  }

  render() {
    const { UID, spec, title, subTitle, parsedBasicInfo } = this.state;
    const { mapId, isSplitScreen } = this.props;
    if (this.props.MAP.showFilterPanel || !UID || !spec) return null;

    const detailList = [];
    if (spec['basic-info']) {
      let detail;
      for (let i = 0; i < parsedBasicInfo.length; i += 1) {
        detail = parsedBasicInfo[i];
        detailList.push((
          <li key={i}>
            <i data-balloon={detail.alt} data-balloon-pos="up">
              <span
                className={`glyphicon glyphicon-${detail.icon}`}
                style={detail.iconColor ? { color: detail.iconColor } : {}}
              />
            </i>
            {typeof detail.value !== 'string' && detail.value.parser ?
              Parser(detail.value)
            : (
              <span>{detail.value}</span>
            )}
          </li>
        ));
      }
    }

    const sidebarRight = mapId === 'map-1' && isSplitScreen ? '48%' : '0';

    return (
      <div className="detail-view-wrapper" style={{ right: sidebarRight }}>
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
            <img
              id="facilityImg"
              alt={`${title}`}
              onClick={(e) => this.onFacilityImageClick(e)}
              src="/assets/img/no-facility-img.jpg" />
          </div>
          <div className="detail-list">
            <ul>{detailList}</ul>
          </div>
        </div>
        {this.props.children ? (
          <div className="detail-extension-wrapper">
            {
              React.Children.map(this.props.children, child => 
                React.cloneElement(child, {
                  parentstate: child.props.parentstate && this.state,
                  parentprops: child.props.parentprops && this.props,
                })
              )
            }

          </div>
        ) : ''}
        {this.state.showImageModal ?
        <div id="image-modal" className="modal">
          <span
            className="close"
            onClick={(e) => this.closeImageModal(e)}
          >&times;</span>
          <img
            alt={`${title}`}
            src="/assets/img/no-facility-img.jpg"
            className="modal-content"
            id="facility-image" />
          <div id="caption">
            {title}
          </div>
        </div> : ''}
      </div>
    );
  }
}

export default connect(mapStateToProps)(DetailView);
