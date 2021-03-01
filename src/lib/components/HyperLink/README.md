# Hyperlink Component

Providing context to the various sections/subsections on the menu would be important especially for new users. The Hyperlink component compliments the menu sections/subsections by adding links to resources and descriptions to share textual insights on a section/subsections on the menu


# How this works
The component is appended on the menu categories and subcategories on both Menu and Layers/ConnectedLayers respectively. If configs are provided from the site-config the component will return links and description as provided, in the event these aren't provided the component returns null

Usage:
 On the Menu/Layers/ConnectedLayers
```js

<HyperLink
     link={link}
     description={description}
     descriptionStyle={descriptionStyle}
/>
```
