# Menu/legend info Links
gisida-react menu component builds menu items/sections based on json spec provided on clients site-config file. Menu/legend info links feature seeks to give context of the selected layer, menu sections and subsections. The links can be added by adding links and descriptions to layer/siteconfig as shown below. 

![alt text](https://raw.githubusercontent.com/onaio/gisida-react/staging/public/assets/img/hyperlink-icon.png)

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
        },
        "BRCiS II Output Indicators": {
          "link": "https://gisida.com",
          "description": "desc"
        }
      }

```
#### Sub-Sector level spec
The `parent category` is used to identify the sub-sector based on parent sector/sub-sector. The parent category should be appended before sector/sub-sector key and separated by a hyphen inside hyperlink property. This helps when we have same sub-sector names in different sectors.

BRCis II is the parent in this case
```
"BRCiS II-Output Indicators": {
        "link": "https://gisida.com",
        "description": "desc"
      }
```
#### Legend (layer level) spec
The following specification should drive information and  icons.

```
    "legendDescription": "desc",
```