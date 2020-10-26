export const layer1 = {
    "label": "RC - Adolescents (15-18 years) enrolled in non-formal/formal education",
    "source": {
        "type": "vector",
        "layer": "180528_outline_rohingya_refug-c2ep2k",
        "url": "mapbox://ona.5t6fsdlt",
        "data": [
        315361,
        "/data/180320_Outline_Rohingya_refugee_camps_sites_centroids.csv"
        ],
        "join": [
        "SSID",
        "submission/rc_loc",
        "New_Camp_S"
        ],
        "relation": {
        "type": "one-to-many",
        "key": [
            "vector",
            "many",
            "one"
        ]
        }
    },
    "type": "fill",
    "property": "total_15_18_adolscent",
    "categories": {
        "breaks": "yes",
        "color": "RdPu",
        "clusters": 7
    },
    "aggregate": {
        "type": "sum",
        "group-by": "submission/rc_loc",
        "date-by": "submission/reporting_period",
        "date-parse": {
        "split": " to ",
        "chunk": 0
        },
        "timeseries": {
        "type": "cumulative",
        "field": "period"
        },
        "extraProps": [
        "total_15_18_adolscent",
        "total_15_18_adolscent_girls",
        "total_15_18_adolscent_boys",
        "rc_rep/rc_boys_cal3",
        "rc_rep/rc_girls_cal3",
        "rc_rep/total3",
        "submission/location_type",
        "reporter/reporter_org",
        "Settlement",
        "submission/reporting_period",
        "New_Camp_S",
        "New_Camp_N",
        "Upazila"
        ],
        "filter": [
        "reporter/reporter_org",
        "Upazila"
        ],
        "accepted-filter-values": [
        "all",
        "all"
        ],
        "filter-label": [
        "Partner",
        "Upazila"
        ],
        "filter-type": [
        "stops",
        "stops"
        ]
    },
    "labels": {
        "data": "data/180320_Outline_Rohingya_refugee_camps_sites_centroids.csv",
        "label": "<b> {{total_15_18_adolscent}} </b>",
        "join": [
        "New_Camp_S",
        "submission/rc_loc"
        ],
        "coordinates": [
        "longitude",
        "latitude"
        ],
        "minZoom": 4.5,
        "height": 30,
        "width": 30
    },
    "data-parse": {
        "submission/rc_loc": {
        "new-prop-name": "parsedUID",
        "key": {
            "CXB-201": "Camp 1E",
            "CXB-202": "Camp 1W"
        }
        },
        "submission/reporting_period": {
        "type": "single",
        "key": {
            "t_A17-F18": "August 2017 to February 2018",
            "t_jan": "January 1 to January 31"
        }
        }
    },
    "detail-view": {
        "UID": "SSID",
        "title": {
        "prop": "Site_name"
        },
        "sub-title": {
        "prop": "New_Camp_N"
        },
        "basic-info": [
        {
            "value": {
            "prop": [
                "longitude",
                "latitude"
            ],
            "join": ", "
            },
            "icon": "screenshot",
            "alt": "GPS coordinates"
        },
        {
            "value": "reporter/reporter_org",
            "icon": "user",
            "alt": "Reporter Org"
        }
        ]
    },
    "rohingyaIndicators": {
        "location_type": "submission/location_type",
        "rc_boys": "rc_rep/rc_boys_cal3",
        "rc_girls": "rc_rep/rc_girls_cal3",
        "rc_total": "rc_rep/total3"
    },
    "popup": {
        "header": "parsedUID",
        "body": "<p style=text-align:left;> <b>Girls:</b> {{total_15_18_adolscent_girls}} <br> <b>Boys:</b> {{total_15_18_adolscent_boys}}<span style=float:right;>"
    },
    "visible": false,
    "credit": "Adolescents (15-18 years) enrolled in non-formal/formal education.",
    "category": "Education",
    "id": "education",
    "loaded": true
}

export const layer2 = {
    "label": "Regionboundaries",
    "source": {
      "type": "vector",
      "layer": "som_adm_1-6k13xf",
      "url": "mapbox://ona.bnc2rzsw"
    },
    "type": "line",
    "paint": {
      "line-width": 2,
      "line-color": "#444",
      "line-opacity": 0.6
    },
    "visible": true,
    "category": "Boundaries",
    "id": "regionboundaries",
    "loaded": true,
    "isLoading": false,
    "filters": {},
    "isChartMin": true,
    "legendBottom": 40,
    "styleSpec": {
      "id": "regionboundaries",
      "type": "line",
      "visible": true,
      "source": {
        "type": "vector",
        "url": "mapbox://ona.bnc2rzsw"
      },
      "layout": {},
      "paint": {
        "line-width": 2,
        "line-color": "#444",
        "line-opacity": 0.6
      },
      "source-layer": "som_adm_1-6k13xf"
    }
  }