# Layers Component

The menu category layers can be rendered using the `Layers` component or the `ConnectedLayers` component.

## Layers

`Layers` component is used to render menu category groups, nested subgroups if any and their layers.
Uses local state to keep track of open groups.

Example usage:

```
  <Layers
    mapId={mapId}
    layers={category.layers}
    currentRegion={currentRegion}
    preparedLayers={preparedLayers}
    auth={this.props.AUTH}
    />
```

## ConnectedLayers

`ConnectedLayers` is used to render menu category groups, nested subgroups if any and their layers.
Uses redux state to keep track of open groups.

This component also allows you to pass a component that renders a custom `<li>` element which will serve as a custom layer item in place of `src/components/Layer/Layers`

Example usage:

```
<ConnectedLayers
  layerItem={CustomLayerComponent}
  mapId={mapId}
  layers={category.layers}
  currentRegion={currentRegion}
  preparedLayers={preparedLayers}
  auth={this.props.AUTH}
/>
```

The usage of the component requires you to have passed a `useConnectedLayers` prop in your client project when
instantiating the `Menu`

```
<Menu useConnectedLayers/>
```

### Why choose ConnectedLayers over Layers?

The advantage of using this component over the `Layers` component is that different `Menu` instances will
share the same state of open groups. If a situation such as this arises, usage of this component will
suffice. 

An example of such a situation is when you would like to navigate from the map to another view
but would like to keep the map's menu in that view.

```
<Map mapId='map-1'>
  <Menu useConnectedLayers>
</Map>

<SomeOtherView>
  {/** This component will use map-1 menu**/}

  <Menu useConnectedLayers>
</SomeOtherView>
```