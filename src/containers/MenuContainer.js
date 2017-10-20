import { connect } from 'react-redux'
import Menu from '../components/Menu/Menu'
import { groupBy } from '../lib/utils'

const mapStateToProps = (state, ownProps) => {

  const categories = [];
  const grouped = groupBy(state.NODES, 'category');
  
  state.NODES.map((node) => { 
    if (node.hasOwnProperty('category')){
      categories.push({
        layers: [{
          name: "test-name",
          "label": "Region labels",
          "source": {
            "type": "geojson",
            "data": "data/ipc_regions_centroid.geojson"
          },
          "type": "symbol",
          "minzoom": 0,
          "paint": {
            "text-color": "#000",
            "text-halo-color": "#fff",
            "text-halo-width": 1.3,
            "text-halo-blur": 1
          },
          "layout": {
            "text-size": 14,
            "text-field": "{region}",
            "text-transform": "uppercase"
          },
          "visible": false
        }],
        sector: node.category
      });
    } else categories.push({
      layers: [],
      sector: "Default"
    });
  })
  console.log(categories)

  return {
    sectorData: categories
   
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

  }
}

const StyleSelctorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);

export default StyleSelctorContainer