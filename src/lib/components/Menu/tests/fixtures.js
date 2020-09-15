export const categories = [
  {
    category: 'Boundaries & Labels',
    layers: [
      {
        'Place Labels': {
          category: 'Place Labels',
          layers: [
            {
              category: 'Place Labels',
              id: 'region-labels',
              label: 'Region labels',
            },
            {
              category: 'Place Labels',
              id: 'district-labels',
              label: 'District labels',
            },
            {
              category: 'Place Labels',
              id: 'banadir-labels',
              label: 'Banadir labels',
            },
          ],
          parent: 'Boundaries & Labels',
        },
      },
      {
        Boundaries: {
          category: 'Boundaries',
          layers: [
            {
              category: 'Boundaries',
              id: 'region-boundaries',
              label: 'Region boundaries',
            },
            {
              category: 'Boundaries',
              id: 'district-boundaries',
              label: 'Districts boundaries',
            },
          ],
          parent: 'Boundaries & Labels',
        },
      },
    ],
  },
];
