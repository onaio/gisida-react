import memoize from 'memoize-one';

/**
 * Check if a user has permission to access layer
 * @param {Object} authConfigs - Authentication configurations
 * @param {Object} userInfo - User details
 */
export const canAccessLayer = (layerId, authConfigs, userInfo) => {
  // list of users with access to the layer
  const users = authConfigs && authConfigs.LAYERS && authConfigs.LAYERS[layerId];

  return (
    (users && userInfo && users.includes(userInfo.username)) ||
    (authConfigs.LAYERS &&
      authConfigs.LAYERS.ALL &&
      authConfigs.LAYERS.ALL.includes(userInfo.username))
  );
};

/**
 * Return an accesible group layer. If the layer has no accessible children
 * return false, else return the modified layer with the accessible children
 * @param {Object} layer - Group layer
 * @param {Object} authConfigs - Authentication configurations
 * @param {Object} userInfo - Auth user details
 */
export const getAccessibleGroupLayer = (layer, authConfigs, userInfo) => {
  const accesibleGroup = {};

  Object.keys(layer).forEach(key => {
    const accessibleKeySubLayers = [];

    layer[key].layers.forEach(subLayer => {
      if (!subLayer.id) {
        const groupSubLayer = getAccessibleGroupLayer(subLayer, authConfigs, userInfo);

        if (groupSubLayer) {
          accessibleKeySubLayers.push(groupSubLayer);
        }
      } else {
        if (canAccessLayer(subLayer.id, authConfigs, userInfo)) {
          accessibleKeySubLayers.push(subLayer);
        }
      }
    });

    if (accessibleKeySubLayers.length > 0) {
      // Return sub layers which user has access to
      accesibleGroup[key] = {
        ...layer[key],
        layers: accessibleKeySubLayers,
      };
    }
  });

  // If user can access any layer with the group, return the group
  if (Object.keys(accesibleGroup).length > 0) {
    return accesibleGroup;
  }

  return false;
};

/**
 * Get which categories and their groups and nested groups user has
 * permission to view
 * @returns {array} Filtered categories
 */
export const getAccessibleCategories = memoize((categories, authConfigs, userInfo) => {
  if (!authConfigs && !userInfo) {
    // If no authenitcation, then all categories are accessible.
    return categories;
  }

  const filteredCategories = [];
  categories.forEach(category => {
    let accesibleLayers = [];

    category.layers.forEach(layer => {
      if (!authConfigs || !authConfigs.LAYERS) {
        // If auth exists but authconfigs have not loaded. Bug should be fixed from ONA data and gisida core
        accesibleLayers.push(layer);
      } else if (!layer.id) {
        const groupLayer = getAccessibleGroupLayer(layer, authConfigs, userInfo);

        if (groupLayer) {
          accesibleLayers.push(groupLayer);
        }
      } else {
        if (canAccessLayer(layer.id, authConfigs, userInfo)) {
          accesibleLayers.push(layer);
        }
      }
    });

    if (accesibleLayers.length > 0) {
      // Modify category layers with the new updated layers
      category.layers = accesibleLayers;
      filteredCategories.push(category);
    }
  });

  return filteredCategories;
});
