export const category1 = {
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
};

export const category2 = {
  category: 'Surveys',
  layers: [
    {
      'WFP, BRCiS, and CASH Consortium': {
        category: 'WFP, BRCiS, and CASH Consortium',
        layers: [
          {
            'Region Level': {
              category: 'Region Level',
              layers: [
                {
                  id: 'coverage-analysis',
                  label:
                    'C & V Coverage Analysis: Percentage Coverage Compared to IPC 3-4 Caseload',
                },
              ],
              parent: 'WFP, BRCiS, and CASH Consortium',
            },
          },
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
};

export const categories = [category1];

export const authConfigs = {
  SITE: 'public',
  VIEWS: {
    Iframe: [
      'brcis_mesh',
      'unicef_mesh',
      'danwadaag_mesh',
      'wfp_mesh',
      'fao_mesh',
      'transtec_mesh',
      'n/a',
      'dfid_mesh',
      'dkwamboka',
      'alepietrobon',
      'who_mesh',
      'jholmes',
    ],
    Summary: ['transtec_mesh', 'dfid_mesh', 'dkwamboka', 'alepietrobon', 'jholmes'],
  },
  LAYERS: {
    'livestock-lost-now': ['kipsigei', 'transtec_mesh', 'dfid_mesh', 'dkwamboka'],
    ALL: ['onasupport', 'transtec_mesh', 'dfid_mesh', 'alepietrobon', 'jholmes'],
    'region-labels': [
      'brcis_mesh',
      'unicef_mesh',
      'danwadaag_mesh',
      'wfp_mesh',
      'fao_mesh',
      'transtec_mesh',
      'dfid_mesh',
      'dkwamboka',
      'who_mesh',
    ],
    'region-boundaries': [
      'brcis_mesh',
      'unicef_mesh',
      'danwadaag_mesh',
      'wfp_mesh',
      'fao_mesh',
      'transtec_mesh',
      'dfid_mesh',
      'dkwamboka',
      'who_mesh',
    ],
    'coverage-analysis-district': ['dkwamboka'],
  },
};

export const user1 = {
  url: 'https://api.ona.io/api/v1/profiles/onasupport',
  username: 'onasupport',
  name: 'OnaSupport',
  email: 'support+2@ona.io',
  city: 'Nairobi',
  country: 'KE',
  organization: 'Ona',
  website: 'ona.io',
  twitter: 'onadata',
  gravatar: '',
  require_auth: false,
  user: 'https://api.ona.io/api/v1/users/onasupport',
  api_token: 'api_token_here',
  temp_token: 'temp_token_here',
};

export const user2 = {
  url: 'https://api.ona.io/api/v1/profiles/onasupport',
  username: 'kipsigei',
  name: 'Kipsigei',
  email: 'support+2@ona.io',
  city: 'Nairobi',
  country: 'KE',
  organization: 'Ona',
  website: 'ona.io',
  twitter: 'onadata',
  gravatar: '',
  require_auth: false,
  user: 'https://api.ona.io/api/v1/users/onasupport',
  api_token: 'api_token_here',
  temp_token: 'temp_token_here',
};

export const user3 = {
  url: 'https://api.ona.io/api/v1/profiles/onasupport',
  username: 'dkwamboka',
  name: 'Kwamboks',
  email: 'support+2@ona.io',
  city: 'Nairobi',
  country: 'KE',
  organization: 'Ona',
  website: 'ona.io',
  twitter: 'onadata',
  gravatar: '',
  require_auth: false,
  user: 'https://api.ona.io/api/v1/users/onasupport',
  api_token: 'api_token_here',
  temp_token: 'temp_token_here',
};

export const user4 = {
  url: 'https://api.ona.io/api/v1/profiles/onasupport',
  username: 'fao_mesh',
  name: 'Fao mesh',
  email: 'support+2@ona.io',
  city: 'Nairobi',
  country: 'KE',
  organization: 'Ona',
  website: 'ona.io',
  twitter: 'onadata',
  gravatar: '',
  require_auth: false,
  user: 'https://api.ona.io/api/v1/users/onasupport',
  api_token: 'api_token_here',
  temp_token: 'temp_token_here',
};
