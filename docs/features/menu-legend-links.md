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
The `parentCategory` is used to identify the sub-sector based on what sector the sub-sector is tied too. This helps when we have same sub-sector names in different sectors.
```
"Output Indicators": {
        "link": "https://gisida.com",
        "parentCategory": "BRCiS II",
        "description": "desc"
      }
```
#### Legend (layer level) spec
The following specification should drive information and  icons.

```
    "legendHyperlink": "https://www.com",
    "legendDescription": "desc",
    "legendHyperlinkText": "report"
```