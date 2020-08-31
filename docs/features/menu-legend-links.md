# Menu/legend info Links
gisida-react menu component builds menu items/sections based on json spec provided on clients site-config file. Menu/legend info links feature seeks to give context of the selected layer, menu sections/subsections. The links can be added by adding links and descriptions to layer/siteconfig as shown below.    

## Usage and expected behaviour

The following are configs to be added when implementing this feature.

### Site level menu (sector/subsector)
##### Sector level spec
The `link` and `description` fields are optional one can be provided another ommitted as desired
```
"hyperLink": {
      "Boundaries": {
        "description": "desc",
        "link": "https://gisida.com",
      }
    },

```
#### Sub-Sector level spec
The `parent category` is used to identify the sub-sector based on parent sector/sub-sector. The parent category should be appended before sector/sub-sector key inside hyperlink property. This helps when we have same sub-sector names in different sectors.

BRCis II is the parent in this case
```
"BRCiS II Output Indicators": {
        "link": "https://gisida.com",
        "description": "desc"
      }
```
#### Legend (layer level) spec
The following specification should drive information and  icons.

"legendDescription": "desc"

```
{
  "APP": {
    "mapConfig": {
      "container": "map",
      "style": "mapbox://styles/mapbox/light-v9",
      "center": [
        36.25
        0.34
      ],
      "zoom": 6
    },
    "accessToken": "<mapbox-studio-access-token>",
    "appIcon": "/img/gisida-logo.png",
    "appName": "GISIDA EXAMPLE",
    "appColor": "darkslategrey",
  },
  "STYLES": [
    {
      "label": "Light",
      "style": "mapbox://styles/mapbox/light-v9"
    }
  ],
  "LAYERS": [
    "ken-health-sites",
  ],
  "legendDescription": "desc"
}
    
```