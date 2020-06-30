The chart components in Gisida are meant to be modular and reusable components which can be used within various contexts throughout the UI. We are utilizing HighCharts and which use default settings unless overwritten with custom options being passed in from a parent "Adapter Component".

# Summary Charts
This use case is an open source feature across Gisida projects and are an additional way to visualize the layer data being represented on the map. These components are initialized by the `charts` property in the project's `MapSpec` object, using a few properties to define which data to visualize and if/how to aggregate it, each chart having `type` and a `spec` properties.

### List of Supported Charts
* [ColumnChart](https://github.com/onaio/gisida-react/tree/staging/src/lib/components/Charts/README.md) 

### Primary Chart
Each layer can have one `Primary` chart which is displayed along the bottom of the screen, outside of the modal. This is defined with the "primary" property within the layer.chart config.

```
"layer-id": {
  ...
  ...
  "charts": {
    "primary": {
      "type": "column",
      "spec": {
        "type": "percent",
        "level": "region",
        "column": "percent_target"
      }
    }
  }
}
```

(Right now, column charts are the only type of chart which can be a primary chart)

### Secondary Charts
Each layer can have multiple secondary charts which will be contained within a summary chart popup modal. Each type of chart can have a single spec defined or an array of specs for multiple of the same chart types.

```
"layer-id": {
  ...
  ...
  "charts": {
    "pie": {
      "type": "breaks",
      "level": "Regions",
      "column": "percent_target"
    },
    "column": [{
      "type": "percent",
      "level": "region",
      "column": "percent_target"
    }, {
      "type": "percent",
      "level": "region",
      "column": "percent_target"
    }]
  }
}
```
## Chart Spec
#### type
(required) This specifieds the way in which the data is supposed to be broken down after being aggregated. 
* **percent** - Simply divide the total from each category by the category count.
* **breaks** - Group the data by `stops`
* **count** - Add up the total per category without dividing (coming soon!)

#### level
(required) The column header or data key by which to aggregate the data, this essentially creates categories for the chart.

#### column (required)
(required) The column header or data key which contians the data to be visualized

#### title
An optional property for secondary charts which renders a title above the chart in the summary chart modal.

#### y-axis-label
An optional property for column charts to override the default axis title
