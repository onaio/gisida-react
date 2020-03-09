import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import $ from 'jquery';
import Script from 'react-load-script';

require('./Export.scss');

const exportPresetKey = {
  small: {
    square: { w: 800, h: 800 },
    landscape: { w: 1280, h: 800 },
    portrait: { w: 800, h: 1200 },
  },
  medium: {
    square: { w: 900, h: 900 },
    landscape: { w: 1440, h: 900 },
    portrait: { w: 900, h: 1440 },
  },
  large: {
    square: { w: 1080, h: 1080 },
    landscape: { w: 1920, h: 1080 },
    portrait: { w: 1080, h: 1920 },
  },
  huge: {
    square: { w: 1440, h: 1440 },
    landscape: { w: 2560, h: 1440 },
    portrait: { w: 1440, h: 2560 },
  },
  A4: {
    square: { w: 2480, h: 2480 },
    landscape: { w: 3508, h: 2480 },
    portrait: { w: 2480, h: 3508 },
    isPrint: true,
  },
  A3: {
    square: { w: 3508, h: 3508 },
    landscape: { w: 4961, h: 3508 },
    portrait: { w: 3508, h: 4961 },
    isPrint: true,
  },
  letter: {
    square: { w: 2550, h: 2550 },
    landscape: { w: 3300, h: 2550 },
    portrait: { w: 2550, h: 3300 },
    isPrint: true,
  },
  tabloid: {
    square: { w: 3300, h: 3300 },
    landscape: { w: 5100, h: 3300 },
    portrait: { w: 3300, h: 5100 },
    isPrint: true,
  },
  pp1: {
    square: { w: 768, h: 768 },
    landscape: { w: 1024, h: 768 },
    portrait: { w: 768, h: 1024 },
  },
  pp2: {
    square: { w: 720, h: 720 },
    landscape: { w: 1280, h: 720 },
    portrait: { w: 720, h: 1280 },
  },
};

const mapStateToProps = (state, ownProps) => {
  const { APP } = state;
  const mapId = ownProps.mapId || 'map-1';
  const MAP = state[mapId] || { blockLoad: true };

  return {
    MAP,
    config: APP.mapConfig,
    map: mapId === 'map-1' ? window.maps[0] : window.maps[1],
    hasNavbar: ownProps.hasNavbar,
  };
};

export class Export extends Component {
  constructor(props) {
    super(props);

    this.onOpenCloseClick = this.onOpenCloseClick.bind(this);
    this.onCaptureClick = this.onCaptureClick.bind(this);
    this.scriptIsLoaded = this.scriptIsLoaded.bind(this);
    this.onOptionsChange = this.onOptionsChange.bind(this);
    this.resetMapAfterExport = this.resetMapAfterExport.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.map) {
      const { html2canvas, devicePixelRatio, innerHeight, innerWidth } = window;
      nextProps.map.resize();
      this.setState({
        isOpen: false,
        isH2Cloaded: (html2canvas && true) || false,
        resValue: 1,
        dimHeight: innerHeight,
        dimWidth: innerWidth,
        titleText: 'Map Export',
        titleRender: false,
        screenWidth: innerWidth,
        screenHeight: innerHeight,
        ratio: 'screen',
        orientation:
          innerHeight === innerWidth
            ? 'square'
            : innerHeight / innerWidth > 1
            ? 'portrait'
            : 'landscape',
        doFitMap: true,
        preset: 'custom',
        ppi: 96 * devicePixelRatio,
        map: nextProps.map,
        config: nextProps.config,
      });
    }
  }

  onOpenCloseClick(e) {
    e.preventDefault();
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  onCaptureClick(e) {
    e.preventDefault();
    const { resValue, dimWidth, dimHeight, titleText, doFitMap, ppi, preset } = this.state;
    const { mapId } = this.props;
    const { map, config } = this.state;
    const self = this;
    // save the previous position of the map
    const prevMapState = {
      zoom: map.getZoom(),
      center: map.getCenter(),
    };

    // resize map container / map
    $(`#${mapId}.mapboxgl-map`).innerWidth(dimWidth / resValue).innerHeight(dimHeight / resValue);
    if (!config.includeNavControls) {
      map.removeControl(map.controls);
    }
    map.resize();

    if (config.mapBounds && doFitMap) {
      // fit to bounds as described in the app config
      map.fitBounds(config.mapBounds, {
        duration: 0,
        padding: 25,
        // not sure why this doesn't work
        // padding: { top: 25, right: 25, bottom: 300, left: 300 },
      });
    } else {
      // or preserve the map center after resizing
      map.setCenter(prevMapState.center);
    }

    // create anchor element to trigger download
    const downloadA = document.createElement('a');
    // set the name of the the file to download
    downloadA.download = `${titleText.replace(/ /g, '-')}.png`;

    // delay momentarily to allow mapbox to re-render
    window.setTimeout(() => {
      // create temporary element to conatain all elements to render in export
      const exportEl = document.createElement('div');
      exportEl.id = 'exportEl';
      $(exportEl)
        .append('<div class="topLeft"></div>')
        .append('<div class="topRight"></div>')
        .append('<div class="bottomLeft"></div>')
        .append('<div class="bottomRight"></div>');
      // set the dimensions of the export container
      $(exportEl)
        .innerWidth(dimWidth / resValue)
        .innerHeight(dimHeight / resValue);

      // determine which elemtns (other than the actual map) needs to be included
      let selectorsToQuery = config.exportIncludes || [];
      selectorsToQuery = selectorsToQuery.concat([`.legend.${mapId}`, '.series']);

      // determine intended output dpi of the image (300 for print, 96 for screens)
      const dpi = exportPresetKey[preset] && exportPresetKey[preset].isPrint ? 300 : 96;
      // calculate how much the cloned elements should be scaled
      const scale = dpi / ppi > 1 ? 1 / (dpi / ppi) : 0.75;

      let nodeToClone;
      let clonedNode;
      let originalStyles;
      // loop through all selectors of element to include
      for (let n = 0; n < selectorsToQuery.length; n += 1) {
        // deterine the node which needs to be cloned
        nodeToClone = document.querySelector(selectorsToQuery[n]);

        if (nodeToClone) {
          // clone the node
          clonedNode = nodeToClone.cloneNode(true);
          // get computed styling of original element
          originalStyles = window.getComputedStyle(nodeToClone);
          // set fixed widths to handle elements with fluid (%/calcualted) widths
          $(clonedNode).innerWidth(originalStyles.width);

          // based on calculated offsets of the original element,
          // determine which direction the cloned element should scale,
          // and append the clone to the appropriate scaling container
          if (
            parseInt(originalStyles.top, 10) < parseInt(originalStyles.bottom, 10) &&
            parseInt(originalStyles.left, 10) < parseInt(originalStyles.right, 10)
          ) {
            $('.topLeft', exportEl).append(clonedNode);
          } else if (
            parseInt(originalStyles.top, 10) < parseInt(originalStyles.bottom, 10) &&
            parseInt(originalStyles.left, 10) > parseInt(originalStyles.right, 10)
          ) {
            $('.topRight', exportEl).append(clonedNode);
          } else if (
            parseInt(originalStyles.top, 10) > parseInt(originalStyles.bottom, 10) &&
            parseInt(originalStyles.left, 10) < parseInt(originalStyles.right, 10)
          ) {
            $('.bottomLeft', exportEl).append(clonedNode);
          } else {
            $('.bottomRight', exportEl).append(clonedNode);
          }
        }
      }

      // scale the scalling containers
      $('.topLeft, .topRight, .bottomLeft, .bottomRight', exportEl).css('transform');
      // insert the export container element in the DOM
      $('body').append(exportEl);
      // move (not copy) the map into the export container
      $('#exportEl').prepend($(`#${mapId}.mapboxgl-map .mapboxgl-canvas-container`));

      // push export container element into a new canvas
      window.html2canvas(exportEl, {
        removeContainer: true, // remove the iframe created by html2canvas
        scale: resValue, // set the scale / resolution of the resulting canvas
        logging: false, // this doesn't seem to work even when true...
      }).then((canvas) => {
        // convert new canvas element to blob (not toDataUrl due to long base64 urls)
        canvas.toBlob((blob) => {
          // restore the map to it's previous state
          self.resetMapAfterExport(prevMapState);
          // create download url from blob object
          downloadA.href = URL.createObjectURL(blob);
          // trigger actual download of exported image
          downloadA.click();
          // delete the export container and it's child clones
          $('#exportEl').remove();
        }, 'image/jpg');
        /**
         * Hide export modal once map is exported
         */
          if (this.props.config["closeExportModal"]){
            this.setState({
              isOpen: !this.state.isOpen
            })
          }
        }, () => {
        // if the promise is rejected, restore the map to it's previous state
        self.resetMapAfterExport(prevMapState);
        // delete the export container and it's child clones
        $('#exportEl').remove();
        // indicate that the exprort failed
        alert('Export Failed - If this issue continues please contact ONA Support.');
      });
    }, 100);
  }

  onOptionsChange(e, option) {
    if (option !== 'titleRender' && option !== 'ratio' && option !== 'fitMap') {
      e.preventDefault();
    }
    const value = e.currentTarget.value || $(e.currentTarget).attr('value');
    let { resValue, dimHeight, dimWidth, orientation } = this.state;
    let { titleText, titleRender, doFitMap, preset } = this.state;
    let store;

    switch (option) {
      case 'resValue':
        dimHeight = (dimHeight / resValue) * value;
        dimWidth = (dimWidth / resValue) * value;
        resValue = value;
        break;
      case 'dimHeight':
        // todo - enable locking of ratio during custom sizing
        // dimRatio = dimWidth / dimHeight;
        dimHeight = value;
        // dimWidth = value * dimRatio;
        // resValue = Math.round(dimHeight / window.innerHeight * 10) / 10;
        break;
      case 'dimWidth':
        // dimRatio = dimHeight / dimWidth;
        dimWidth = value;
        // dimHeight = value * dimRatio;
        // resValue = Math.round(dimHeight / window.innerHeight * 10) / 10;
        break;
      case 'titleText':
        titleText = value;
        break;
      case 'titleRender':
        titleRender = !titleRender;
        break;
      case 'orientation':
        orientation = value;
        store = { w: dimWidth, h: dimHeight };
        if (preset !== 'custom') {
          dimHeight = exportPresetKey[preset][orientation].h;
          dimWidth = exportPresetKey[preset][orientation].w;
        } else {
          dimWidth = store.h;
          dimHeight = store.w;
        }
        if (orientation === 'square') {
          dimHeight = store.h < store.w ? store.h : store.w;
          dimWidth = dimHeight;
        }
        resValue =
          orientation !== 'landscape'
            ? window.innerHeight < dimHeight
              ? dimHeight / window.innerHeight
              : 1
            : window.innerWidth < dimWidth
            ? dimWidth / window.innerWidth
            : 1;
        break;
      case 'fitMap':
        doFitMap = !doFitMap;
        break;
      case 'preset':
        preset = value;
        if (value !== 'custom') {
          dimHeight = exportPresetKey[preset][orientation].h;
          dimWidth = exportPresetKey[preset][orientation].w;
        }
        resValue =
          orientation !== 'landscape'
            ? window.innerHeight < dimHeight
              ? dimHeight / window.innerHeight
              : 1
            : window.innerWidth < dimWidth
            ? dimWidth / window.innerWidth
            : 1;
        break;
      default:
        break;
    }

    this.setState({
      resValue,
      dimHeight,
      dimWidth,
      titleText,
      titleRender,
      orientation,
      doFitMap,
      preset,
    });
  }

  resetMapAfterExport(prevMapState) {
    const { mapId } = this.props;
    const { map, config } = this.state;
    // move the map container element back to where it came from
    $('#exportEl .mapboxgl-canvas-container').insertBefore(`#${mapId} .mapboxgl-control-container`);
    // remove fixed hight and width styling
    $(`#${mapId}.mapboxgl-map`).removeAttr('style');
    // restore the map controls
    map.addControl(map.controls);
    // resize the map to it's containers new size
    map.resize();
    // if the map was fit to the container for export, restore it's previous center/zoom
    if (config.mapBounds) {
      map.setCenter(prevMapState.center);
      map.setZoom(prevMapState.zoom);
    }
  }

  scriptIsLoaded() {
    this.setState({
      isH2Cloaded: true
    });
  }

  updateScreenDimensions() {
    this.setState({
      screenHeight: window.innerHeight,
      screenWidth: window.innerWidth,
    });
  }

  render() {
    if (!this.state) {
      return null;
    }
    const { isOpen, isH2Cloaded, preset, doFitMap } = this.state;
    const { dimHeight, dimWidth, orientation } = this.state;

    return (
      <div>
        <a
          className={`export-modal-btn export-btn-${this.props.mapId}`}
          href="#"
          onClick={e => {
            this.onOpenCloseClick(e);
          }}
          style={{
            right: '10px',
            top: this.props.hasNavbar ? '195px' : '150px',
          }}
        >
          <span className="glyphicon glyphicon-camera" />
        </a>

        {isOpen ? (
          isH2Cloaded ? (
            <div id="screenshot-modal">
              <span
                role="button"
                className={'glyphicon glyphicon-remove closeBtn'}
                onClick={e => {
                  this.onOpenCloseClick(e);
                }}
                tabIndex={-1}
              />
              <form className="exportOptions">
                <h3>Map Export Options</h3>
                {/* Resolution Multiplier
                <div>
                  <h5>Resolution</h5>
                  <input
                    id={`resRange-${this.props.mapId}`}
                    className="resRange"
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    onChange={(e) => { this.onOptionsChange(e, 'resValue'); }}
                    value={resValue}
                  />
                  <input
                    id={`resValue-${this.props.mapId}`}
                    className="resValue"
                    type="number"
                    min="0.1"
                    max="10"
                    onChange={(e) => { this.onOptionsChange(e, 'resValue'); }}
                    value={resValue}
                  />
                </div>
                */}
                <div>
                  <h5>Image Size</h5>
                  <select
                    id={`preset-size-${this.props.mapId}`}
                    onChange={e => {
                      this.onOptionsChange(e, 'preset');
                    }}
                  >
                    <option value="custom" selected disabled>
                      Select a Size
                    </option>
                    <optgroup label="Web (px)">
                      <option value="small">Small (1280 x 800 px)</option>
                      <option value="medium">Medium (1440 x 900 px)</option>
                      <option value="large">Large (1920 x 1080 px)</option>
                      <option value="huge">Huge! (2560 x 1440 px)</option>
                    </optgroup>
                    <optgroup label="Print">
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="A3">A3 (297 × 420 mm)</option>
                      <option value="letter">Letter (8.5 x 11 in)</option>
                      <option value="tabloid">Tabloid (11 x 17 in)</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="pp1">Powerpoint (standard)</option>
                      <option value="pp2">Powerpoint (widescreen)</option>
                      <option value="custom">Custom...</option>
                    </optgroup>
                  </select>
                </div>
                <div className="dimensions">
                  Width:
                  <input
                    id={`dimWidth-${this.props.mapId}`}
                    className={`dimWidth${preset !== 'custom' ? ' disabled' : ''}`}
                    type="number"
                    onChange={e => {
                      this.onOptionsChange(e, 'dimWidth');
                    }}
                    value={Math.round(dimWidth)}
                    disabled={preset !== 'custom'}
                  />
                  px&nbsp;&nbsp;&nbsp;&nbsp;Height:
                  <input
                    id={`dimHeight-${this.props.mapId}`}
                    className={`dimHeight${preset !== 'custom' ? ' disabled' : ''}`}
                    type="number"
                    onChange={e => {
                      this.onOptionsChange(e, 'dimHeight');
                    }}
                    value={Math.round(dimHeight)}
                    disabled={preset !== 'custom'}
                  />
                  px
                </div>
                <div className="orientation">
                  <h5>Orientation</h5>
                  <ul className="ratioOptions">
                    <li>
                      <label htmlFor={`ratio-portrait-${this.props.mapId}`}>Portrait</label>
                      <div
                        style={{ width: `${(2 / 3) * 100}px` }}
                        onClick={e => {
                          this.onOptionsChange(e, 'orientation');
                        }}
                        role="button"
                        value="portrait"
                        tabIndex={-1}
                        className={orientation === 'portrait' ? 'selected' : ''}
                      />
                      <span>
                        <input
                          id={`ratio-portrait-${this.props.mapId}`}
                          name="ratio"
                          type="radio"
                          value="portrait"
                          onClick={e => {
                            this.onOptionsChange(e, 'orientation');
                          }}
                          checked={orientation === 'portrait'}
                        />
                      </span>
                    </li>
                    <li>
                      <label htmlFor={`ratio-landscape-${this.props.mapId}`}>Landscape</label>
                      <div
                        style={{ width: '150px' }}
                        onClick={e => {
                          this.onOptionsChange(e, 'orientation');
                        }}
                        role="button"
                        value="landscape"
                        tabIndex={-1}
                        className={orientation === 'landscape' ? 'selected' : ''}
                      />
                      <span>
                        <input
                          id={`ratio-landscape-${this.props.mapId}`}
                          name="ratio"
                          type="radio"
                          value="landscape"
                          onClick={e => {
                            this.onOptionsChange(e, 'orientation');
                          }}
                          checked={orientation === 'landscape'}
                        />
                      </span>
                    </li>
                    <li>
                      <label htmlFor={`ratio-square-${this.props.mapId}`}>Square</label>
                      <div
                        style={{ width: '100px' }}
                        onClick={e => {
                          this.onOptionsChange(e, 'orientation');
                        }}
                        role="button"
                        value="square"
                        tabIndex={-1}
                        className={orientation === 'square' ? 'selected' : ''}
                      />
                      <span>
                        <input
                          id={`ratio-square-${this.props.mapId}`}
                          name="ratio"
                          type="radio"
                          value="square"
                          onChange={e => {
                            this.onOptionsChange(e, 'orientation');
                          }}
                          checked={orientation === 'square'}
                        />
                      </span>
                    </li>
                  </ul>
                  {
                    this.state.config.mapBounds ? (
                      <div className="toFitToBounds">
                        <input
                          id={`do-fit-${this.props.mapId}`}
                          className="fitMap"
                          type="checkbox"
                          checked={doFitMap}
                          onClick={(e) => { this.onOptionsChange(e, 'fitMap'); }}
                        />
                        <label
                          htmlFor={`do-fit-${this.props.mapId}`}
                        >Fit map to export size and aspect ratio</label>
                      </div>
                    ) : (
                        // todo - add link to documentation
                        <span className="boundsNote">
                          Note: Provide the &apos;mapBounds&apos; configuration
                        option to enable fitting the map<br />
                          within the exported image.
                      </span>
                      )
                  }
                </div>
                <div>
                  <h5>Title</h5>
                  <input
                    id={`titleText-${this.props.mapId}`}
                    className="titleText"
                    type="text"
                    placeholder="Map Export"
                    onChange={e => {
                      this.onOptionsChange(e, 'titleText');
                    }}
                  />
                  {
                    // todo - generate and include title element for rendering
                    // <input
                    //   id={`titleRender-${this.props.mapId}`}
                    //   className="titleRender"
                    //   type="checkbox"
                    //   onClick={(e) => { this.onOptionsChange(e, 'titleRender'); }}
                    //   checked={titleRender}
                    // />
                    // <label
                    //   htmlFor={`titleRender-${this.props.mapId}`}
                    //   onClick={(e) => { this.onOptionsChange(e, 'titleRender'); }}
                    // >Export with title</label>
                  }
                </div>
              </form>
              {
                // todo - convert this to the tag with download and blob URL
                // so users can right-click and Save As..
              }
              <a
                role="button"
                tabIndex={-1}
                className="export-btn"
                onClick={e => {
                  this.onCaptureClick(e);
                }}
              >
                Export Map
              </a>
            </div>
          ) : (
            <Script
              url="https://html2canvas.hertzen.com/dist/html2canvas.min.js"
              onLoad={() => {
                this.scriptIsLoaded();
              }}
            />
          )
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Export);

Export.propTypes = {
  mapId: PropTypes.string.isRequired,
  map: PropTypes.objectOf(PropTypes.any).isRequired,
  config: PropTypes.objectOf(PropTypes.any).isRequired,
};
