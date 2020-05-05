# Share Url (map state to url)

Rapid decision making can be challenging for organizations. Share url feature allows for rapid decision making by allowing users to share specific layer selections and map positions.

 The share url feature enables (re-)initializing a map with a given state based on url parameters.


## Usage and expected behaviour
The following are steps to be taken and expected behaviour when sharing a url.

1. Select layers that you would wish to share. 
![alt text](https://raw.githubusercontent.com/onaio/gisida-react/pushlayertourl/public/assets/img/layer-selection.png)

    - The layers should be pushed to url based on selected map instance.
        
        e.g     
http://stage-zimbabwe.onalabs.org/?map-1-layers=zim-province-pop&map-2-layers=5w-wash-safewater-province

2. Select the share button to copy link to clipboard
    ![Test Image 4](https://raw.githubusercontent.com/onaio/gisida-react/pushlayertourl/public/assets/img/share-icon.png)
    - An alert should appear confirming the link has been copied to clip board
    ![Test Image 4](https://raw.githubusercontent.com/onaio/gisida-react/pushlayertourl/public/assets/img/alert.png)
3. Paste the copied url on a new tab to ensure it works as expected.
    - The layer should load with the selections you made on step 1
With this, you should be able to share the link
