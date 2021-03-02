# Highlight Faux layer

The highlight faux layer feature seeks to enable changing/highlighting symbol layer icon color on click. Unfortunately, Mapbox supports icon-color on sdf icons only. This introduces complexity when trying to achieve this very objective using svg icons. More details on this can be found here:
https://github.com/mapbox/mapbox-gl-js/issues/1817
https://stackoverflow.com/questions/38068820/how-to-change-marker-color-and-icon-on-clicking-a-marker-in-mapbox/38083323#38083323

## highlight-filter-property

The highlight-filter-property adds a layer replica/imitation of the existing layer. This property should be added on the layer spec of the target layer and expects a string value of a property with unique values.

```
{
    "highlight-filter-property": "Fixed Site UUID",
}
```

## highlight-layout

The highlight-layout property is similar to the layout property on a symbol layer. This should be configured as per what is desired.

Here is an example:

```
{
    "highlight-layout": {
        "text-size": {
                "stops": [
                    [5, 0],
                    [7, 5],
                    [8, 10]
                ]
            },
        "text-field": "{facility_names}",
        "text-offset": [0, 2],
        "icon-image": "nutrition-sites-green",
        "icon-size": 1.25,
    },
}
```

## highlight-paint

This property is same as paint property. This should includes supported paint properties to achieve the desired effect

Here is an example:

```
{
    "highlight-paint": {
        "text-color": "#19A447"
    },
}
```
