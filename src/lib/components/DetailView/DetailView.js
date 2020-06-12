import React, { Component } from 'react';
import { buildDetailView, buildParsedBasicDetailItem } from 'gisida';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import { buildLayersObj } from '../../utils';
import './DetailView.scss';

const mapStateToProps = (state, ownProps) => {
  const MAP = state[ownProps.mapId] || {
    layers: {},
    filter: {},
    timeseries: {},
  };
  const { detailView } = MAP;
  const layerObj = detailView && detailView.layerId ? MAP.layers[detailView.layerId] : null;
  let timeLayer;
  buildLayersObj(MAP.layers).forEach(layer => {
    if (layer && layer.visible && layer.aggregate && layer.aggregate.timeseries) {
      timeLayer = layer.id;
    }
  });
  timeLayer = MAP.timeseries[MAP.primaryLayer] ? MAP.primaryLayer : timeLayer;
  return {
    APP: state.APP,
    MAP: MAP,
    LOC: state.LOC,
    mapId: ownProps.mapId,
    timeSeriesObj: MAP.timeseries[timeLayer],
    isSplitScreen: state.VIEW && state.VIEW.splitScreen,
    layerObj,
    detailView: detailView && detailView.model,
    properties: detailView && detailView.properties,
    spec: detailView && detailView.spec,
    children: ownProps.children,
    profileViewKey: detailView && detailView.model && detailView.model.UID,
  };
};

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
      showImageModal: true,
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
    } else if (
      nextProps.timeSeriesObj &&
      detailView &&
      nextProps.timeSeriesObj.layerId === layerObj.id
    ) {
      const { timeSeriesObj, layerObj, spec, properties } = nextProps;
      const { UID, title, subTitle, basicInfo, 'image-url': imageURL } = detailView;
      const newParsedBasicInfo = [];
      let parsedDet;
      const join = layerObj['detail-view'].join || layerObj.source.join;
      const newProps = timeSeriesObj.data.find(
        d => (d.properties || d)[join[1]] === properties[join[0]]
      );

      if (!newProps) {
        this.setState({
          UID: null,
        });
        return false;
      }
      for (let b = 0; b < basicInfo.length; b += 1) {
        parsedDet = buildParsedBasicDetailItem(basicInfo[b], newProps)
          ? buildParsedBasicDetailItem(basicInfo[b], newProps)
          : buildParsedBasicDetailItem(basicInfo[b], properties);
        if (parsedDet) newParsedBasicInfo.push(parsedDet);
      }
      this.setState({
        UID,
        title,
        spec,
        subTitle,
        layerObj,
        imageURL,
        parsedBasicInfo: newParsedBasicInfo,
      });
    } else {
      const {
        UID,
        title,
        subTitle,
        basicInfo,
        parsedBasicInfo,
        'image-url': imageURL,
      } = detailView;
      this.setState({
        UID,
        title,
        subTitle,
        imageURL,
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
    let center, zoom;
    /**
     * Datermining center and zoom when closing detailview
     * on Close Click Ease to layer location
     * if layer has no location ease to active LOC
     * else ease into mapconfig levels*/
    if (this.props.MAP.layers[this.props.MAP.primaryLayer].location) {
      center = this.props.MAP.layers[this.props.MAP.primaryLayer].location.center;
      zoom = this.props.MAP.layers[this.props.MAP.primaryLayer].location.zoom;
    } else if (this.props.LOC && this.props.LOC.location) {
      center = Array.isArray(this.props.LOC.location.center)
        ? {
          lng: this.props.LOC.location.center[0],
          lat: this.props.LOC.location.center[1],
        }
        : { ...this.props.LOC.location.center };
      zoom = this.props.LOC.location.zoom;
    } else {
      center = Array.isArray(this.props.APP.mapConfig.center)
        ? {
          lng: this.props.APP.mapConfig.center[0],
          lat: this.props.APP.mapConfig.center[1],
        }
        : { ...this.props.APP.mapConfig.center };
      zoom = this.props.LOC.location ? this.props.LOC.location.zoom : this.props.APP.mapConfig.zoom;
    }
    window.maps[0].easeTo({
      center,
      zoom: zoom,
    });
    buildDetailView(this.props.mapId, null, null, this.props.dispatch);
  }

  render() {
    const { UID, spec, title, subTitle, parsedBasicInfo, imageURL } = this.state;
    const { mapId, isSplitScreen } = this.props;
    if (this.props.MAP.showFilterPanel || !UID || !spec) {
      return null;
    }
    const detailList = [];
    if (spec['basic-info']) {
      let detail;
      for (let i = 0; i < parsedBasicInfo.length; i += 1) {
        detail = parsedBasicInfo[i];
        detailList.push(
          detail && detail.icon ? (
            <li key={i}>
              <i data-balloon={detail.alt} data-balloon-pos="up">
                <span
                  className={detail.icon}
                  style={detail.iconColor ? { color: detail.iconColor } : {}}
                />
              </i>
              {typeof detail.value !== 'string' && detail.value.parser ? (
                Parser(detail.value)
              ) : (
                  <span>{`${
                    detail.prefix
                      ? `${detail.prefix}: `
                      : detail.useAltAsPrefix
                        ? `${detail.alt}: `
                        : ''
                    }${detail.value}${detail.suffix ? `${detail.suffix}` : ''}`}</span>
                )}
            </li>
          ) : (
              <li key={i}>
                <b> {`${detail.alt}:`} </b>
                {typeof detail.value !== 'string' && detail.value.parser ? (
                  Parser(detail.value)
                ) : (
                    <span>{detail.value}</span>
                  )}
              </li>
            )
        );
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
          <div className="detail-header" style={!imageURL ? { minHeight: 'auto' } : {}}>
            <h4>{title}</h4>
            {!!subTitle && subTitle !== title ? <h6>{subTitle}</h6> : ''}
            {imageURL ? (
              <img
                id="facilityImg"
                alt={`${title}`}
                onClick={e => this.onFacilityImageClick(e)}
                src={imageURL}
              />
            ) : null}
          </div>
          {detailList.length ? (
            <div className="detail-list">
              <ul>{detailList}</ul>
            </div>
          ) : null}
        </div>
        {this.props.children ? (
          <div className="detail-extension-wrapper">
            {React.Children.map(this.props.children, child =>
              React.cloneElement(child, {
                key: this.props.profileViewKey,
                parentstate: child.props.parentstate && this.state,
                parentprops: child.props.parentprops && this.props,
              })
            )}
          </div>
        ) : (
            ''
          )}
        {this.state.showImageModal ? (
          <div id="image-modal" className="modal">
            <span className="close" onClick={e => this.closeImageModal(e)}>
              &times;
            </span>
            <img alt={`${title}`} src={imageURL} className="modal-content" id="facility-image" />
            <div id="caption">{title}</div>
          </div>
        ) : (
            ''
          )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(DetailView);
