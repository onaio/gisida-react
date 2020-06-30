
# ColumnChart
ColumnChart Component is responsible for rendering a column type chart. Based on highcharts, the component takes in props which overide or add chart options. These props control styling and chart views by tweaking the [highcharts api's](https://api.highcharts.com/highcharts/). 
## ColumnChart Props
### Example
```
const props = {
  "categories": [
    "Bay",
    "Nugaal"
  ],
  "isPercent": false,
  "seriesData": [
    {
      "name": "Bay",
      "y": 326,
      "color": "rgba(0, 90, 50, 0.8)"
    },
    {
      "name": "Nugaal",
      "y": 147,
      "color": "rgba(35, 139, 69, 0.8)"
    },
  ],
  "targetMark": 1,
  "chartWidth": 1115,
  "chartHeight": 145,
  "yAxisLabel": "Children treated",
  "showLegend": false
}
<ColumnChart {...props} />
```
Will show this output
image ---- add image [] ()


### Props
ColumnChart component takes these props:

**Categories** - Represents the x values on the chart. If not given they will be automatically calculated either starting at 0 and incremented by 1, or from pointStart and pointInterval given in the series options. If you provide the categories, these will be used e.g. ```[
    "Bay",
    "Nugaal"
  ]```

**seriesTitle** - An optional property for secondary charts which renders a title above the chart in the column chart modal

**seriesData** - An array of data points for the series, further explanation on this can be found [here](https://api.highcharts.com/highcharts/series.column.data) e.g ``` [0, 5, 3, 5] ```

**chartHeight, chartWidth, chartSpacing, chartMargin** - General chart options. Extra props can be added to address various styling use cases. More info can be found [here](https://api.highcharts.com/highcharts/chart)

**xAxis** - When using dual or multiple x axes, this number defines which xAxis the particular series is connected to. It refers to either the {@link #xAxis.id|axis id} or the index of the axis in the xAxis array, with 0 being the first. This defaults to 0.

**yAxis** - When using dual or multiple y axes, this number defines which yAxis the particular series is connected to. It refers to either the {@link #yAxis.id|axis id} or the index of the axis in the yAxis array, with 0 being the first. This defaults to 0

**yAxisLabel** - An optional property for column charts to override the default axis title
      
**pointFormatterFunc** - Tooltip formating method. Overrides default highchart tooltipformat e.g 
``` 
pointFormatterFunc() => {
    return `<span>${this.y}%</span>`;
  } 
```

**chartType** -
      
**doubleChart** - Optional Custom prop used to identify if we are building double/ single chart. Defaults to single chart. boolean value true/false
      
**legendOptions** - Optional prop that override the symbol creator function and creates custom legend symbols check various options you can tweak on the [legend api](https://api.highcharts.com/highcharts/legend)

**series** - Series options for specific data and the data itself (general options for all series)

**tooltip** - A configuration object for the tooltip rendering of each single series

**showLegend** - optional prop that decides whether or not to show chart legends. Defaults to true.
