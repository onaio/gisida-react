import { canAccessLayer, getAccessibleGroupLayer, getAccessibleCategories } from '../utils';
import { authConfigs, user1, user2, user3, user4, category1, category2 } from './fixtures';

describe('components/Menu/utils/canAccessLayer', () => {
  it('should return true if user can access all layers', () => {
    expect(canAccessLayer('livestock-lost-now', authConfigs, user1)).toEqual(true);
    expect(canAccessLayer('region-labels', authConfigs, user1)).toEqual(true);
    expect(canAccessLayer('region-boundaries', authConfigs, user1)).toEqual(true);
  });

  it('it should return correctly if user has only access to a certain layer', () => {
    expect(canAccessLayer('livestock-lost-now', authConfigs, user2)).toEqual(true);
    expect(canAccessLayer('region-labels', authConfigs, user2)).toEqual(false);
  });
});

describe('components/Menu/utils/getAccessibleGroupLayer', () => {
  it('returns correctly for a user who can access all layers', () => {
    expect(getAccessibleGroupLayer(category1.layers[0], authConfigs, user1)).toEqual(
      category1.layers[0]
    );
    // Nested groups
    expect(getAccessibleGroupLayer(category2.layers[0], authConfigs, user1)).toEqual(
      category2.layers[0]
    );
  });

  it('returns false if user has no access to any layers under that group', () => {
    expect(getAccessibleGroupLayer(category1.layers[0], authConfigs, user2)).toEqual(false);
    // Nested groups
    expect(getAccessibleGroupLayer(category2.layers[0], authConfigs, user2)).toEqual(false);
  });

  it('removes layers that user has no access to', () => {
    expect(getAccessibleGroupLayer(category1.layers[0], authConfigs, user3)).toEqual({
      'Place Labels': {
        category: 'Place Labels',
        layers: [
          {
            category: 'Place Labels',
            id: 'region-labels',
            label: 'Region labels',
          },
        ],
        parent: 'Boundaries & Labels',
      },
    });
    // Nested groups
    expect(getAccessibleGroupLayer(category2.layers[0], authConfigs, user3)).toEqual({
      'WFP, BRCiS, and CASH Consortium': {
        category: 'WFP, BRCiS, and CASH Consortium',
        layers: [
          {
            'District Level': {
              category: 'District Level',
              layers: [
                {
                  id: 'coverage-analysis-district',
                  label:
                    'C & V Coverage Analysis: Percentage Coverage Compared to IPC 3-4 Caseload',
                },
              ],
              parent: 'WFP, BRCiS, and CASH Consortium',
            },
          },
        ],
        parent: 'Surveys',
      },
    });
  });
});

describe('components/Menu/utils/getAccessibleCategories', () => {
  it('should return all categories if user can access all layers', () => {
    expect(getAccessibleCategories([category1, category2], authConfigs, user1)).toEqual([
      category1,
      category2,
    ]);
  });

  it('returns an empty list if user has no access to categories', () => {
    expect(getAccessibleCategories([category1, category2], authConfigs, user2)).toEqual([]);
  });

  it('removes category groups that user has no access to', () => {
    expect(getAccessibleCategories([category1, category2], authConfigs, user3)).toEqual([
      {
        ...category1,
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
              ],
              parent: 'Boundaries & Labels',
            },
          },
        ],
      },
      {
        ...category2,
        layers: [
          {
            'WFP, BRCiS, and CASH Consortium': {
              category: 'WFP, BRCiS, and CASH Consortium',
              layers: [
                {
                  'District Level': {
                    category: 'District Level',
                    layers: [
                      {
                        id: 'coverage-analysis-district',
                        label:
                          'C & V Coverage Analysis: Percentage Coverage Compared to IPC 3-4 Caseload',
                      },
                    ],
                    parent: 'WFP, BRCiS, and CASH Consortium',
                  },
                },
              ],
              parent: 'Surveys',
            },
          },
        ],
      },
    ]);
  });

  it('removes categories that user has no access to', () => {
    expect(getAccessibleCategories([category1, category2], authConfigs, user4)).toEqual([
      {
        ...category1,
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
              ],
              parent: 'Boundaries & Labels',
            },
          },
        ],
      },
    ]);
  });
});
