import React, { Component } from 'react';
import { buildDetailView, buildParsedBasicDetailItem } from 'gisida';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import { buildLayersObj } from '../../utils';
import './DetailView.scss';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || { layers: {}, filter: {}, timeseries: {} };
  const { detailView } = MAP;
  const layerObj = (detailView && detailView.layerId)
    ? MAP.layers[detailView.layerId] : null;
  let timeLayer;
  buildLayersObj(MAP.layers).forEach((layer) => {
    if (layer && layer.visible && layer.aggregate && layer.aggregate.timeseries) {
      timeLayer = layer.id;
    }
  });
  timeLayer = MAP.timeseries[MAP.primaryLayer] ? MAP.primaryLayer : timeLayer;
  return {
    APP: state.APP,
    MAP: MAP,
    mapId: ownProps.mapId,
    timeSeriesObj: MAP.timeseries[timeLayer],
    isSplitScreen: state.VIEW && state.VIEW.splitScreen,
    layerObj,
    detailView: detailView && detailView.model,
    properties: detailView && detailView.properties,
    spec: detailView && detailView.spec,
    children: ownProps.children,
  }
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
    const { layerObj, properties, spec, detailView, mapId } = nextProps;
    if (!layerObj || !spec || !properties || !detailView) {
      this.setState({ UID: null });
    } else if (nextProps.timeSeriesObj && detailView) {
      const { timeSeriesObj, layerObj, spec } = nextProps;
      const { UID, title, subTitle, basicInfo } = detailView;
      const newParsedBasicInfo = [];
      let parsedDet;
      const newProps = timeSeriesObj.data.find(d => (d.properties||d)[layerObj.source.join[1]] === properties[layerObj.source.join[0]]);
      if (!newProps) {
        this.setState({
          UID: null,
        });
        return false;
      }
      for (let b = 0; b < basicInfo.length; b += 1) {
        parsedDet = buildParsedBasicDetailItem(basicInfo[b], newProps);
        if (parsedDet) newParsedBasicInfo.push(parsedDet);
      }
      this.setState({
        UID,
        title,
        spec,
        subTitle,
        layerObj,
        parsedBasicInfo: newParsedBasicInfo,
      });
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
        mapId,
      });
    }
  }

  onCloseClick(e) {
    e.preventDefault();
    const center = Array.isArray(this.props.APP.mapConfig.center) ?
    { lng: this.props.APP.mapConfig.center[0], lat: this.props.APP.mapConfig.center[1] } : { ...this.props.APP.mapConfig.center }
    window.maps[0].easeTo({
      center,
      zoom: this.props.APP.mapConfig.zoom,
    });
    buildDetailView(this.props.mapId, null, null, this.props.dispatch);
  }

  render() {
    const { UID, spec, title, subTitle, parsedBasicInfo } = this.state;
    const { mapId, isSplitScreen } = this.props;
    if (this.props.MAP.showFilterPanel || !UID || !spec) {
      return null
    };
    const detailList = [];
    if (spec['basic-info']) {
      let detail;
      for (let i = 0; i < parsedBasicInfo.length; i += 1) {
        detail = parsedBasicInfo[i];
        detailList.push((
          detail && detail.icon ?
          (<li key={i}>
            <i data-balloon={detail.alt} data-balloon-pos="up">
              <span
                
                className={detail.icon}
                style={detail.iconColor ? { color: detail.iconColor } : {}}
              />
            </i>
            {typeof detail.value !== 'string' && detail.value.parser ?
              Parser(detail.value)
            : (
              <span>{`${detail.prefix ? `${detail.prefix}: ` : detail.useAltAsPrefix ? `${detail.alt}: ` : ''}${detail.value}${detail.suffix ? `${detail.suffix}` : ''}`}</span>
            )}
          </li>) : 
           (<li key={i}>
              <b> {`${detail.alt}:`} </b> 
            {typeof detail.value !== 'string' && detail.value.parser ?
              Parser(detail.value)
            : (
              <span>{detail.value}</span>
            )}
          </li>)
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
