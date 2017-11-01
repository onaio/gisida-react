const defaultState = {
  isLoaded: false,
  processedLayers: {},
  activeLayers: {},
  layersToRemove: [],
  layersToAdd: [],
};
// todo move this to gisida
export function MAP(state = defaultState, action) {
  let activeLayers;
  let activeLayerKeys;
  let processedLayers;
  let layersToRemove;
  let layersToAdd;

  switch (action.type) {
    case 'IS_LOADED':
      return {
        ...state,
        isLoaded: true,
      };
      break;

    case 'ADD_LAYERS':
      processedLayers = {...state.processedLayers};
      activeLayers = {...state.activeLayers};
      layersToAdd = [];

      action.layers.forEach((l) => {
        processedLayers[l.id] = l;
        if (!Object.keys(activeLayers).includes(l.id)) {
          layersToAdd.push(l.id);
        }
        activeLayers[l.id] = l;
      })
      return {
        ...state,
        processedLayers,
        activeLayers,
        layersToAdd,
      };
      break;

    case 'REMOVE_LAYERS':
      activeLayerKeys = Object.keys(state.activeLayers);
      activeLayers = {};
      layersToRemove = [];

      activeLayerKeys.forEach((l) => {
        if (!action.layers.includes(l)) {
          activeLayers[l] = {...state.activeLayers[l]};
        } else {
          layersToRemove.push(l);
        }
      });

      return {
        ...state,
        activeLayers,
        layersToRemove,
      };
      break;

    case 'LAYERS_REMOVED':
      return {
        ...state,
        layersToRemove: [],
      };
      break;

    case 'LAYERS_ADDED':
      return {
        ...state,
        layersToAdd: [],
      };
      break;

    default:
      return state;
      break;
  }
}

// export function LAYERS(state, action) {
//   switch (action.type) {
//     case 'CIRCLE_LAYER':

//       break;

//     default:
//       return state;
//       break;
//   }
// }
