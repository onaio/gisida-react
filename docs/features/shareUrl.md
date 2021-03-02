# Share Url (map state to URL)

Rapid decision making can be challenging for organizations. Share URL feature allows for rapid decision making by allowing users to share specific layer selections and map positions.

The share URL feature enables (re-)initializing a map with a given state based on URL parameters.

## Usage and expected behaviour

The following are steps to be taken and expected behaviour when sharing a URL.

1.  Select layers that you would wish to share.
    ![alt text](https://raw.githubusercontent.com/onaio/gisida-react/staging/public/assets/img/layer-selection.png)

    You can also change the map style.
    ![alt text](https://raw.githubusercontent.com/onaio/gisida-react/staging/public/assets/img/style-selection.png)

        - The layers should be pushed to URL based on selected map instance.
        - The style should be pushed to URL if the the style was changed

            e.g

    http://stage-zimbabwe.onalabs.org/?map-1-layers=zim-province-pop&map-2-layers=5w-wash-safewater-province&map-1-style=0

2.  Select the share button to copy link to clipboard
    ![Test Image 4](https://raw.githubusercontent.com/onaio/gisida-react/staging/public/assets/img/share-icon.png)
    - An alert should appear confirming the link has been copied to clip board
      ![Test Image 4](https://raw.githubusercontent.com/onaio/gisida-react/staging/public/assets/img/alert.png)
3.  Paste the copied URL on a new tab to ensure it works as expected. - The layer should load with the selections you made on step 1
    With this, you should be able to share the link
