//object to be inputted for the groupBy util function

const exInputForGroupBy = 
[[{ //0
  'Type of site': 'Hospital',
  'Services': 'OTP'
}, {
  'Type of site': 'hospital',
  'Services': 'MCH TSP'
}, {
  'Type of site': 'Health post',
  'Services': 'MCH Other',
  'Other Services': 'Nutrition Counseling'
}], //1
[{
  'Type of site': 'Hospital',
  'Services': {
    'Service 1': 'OTP',
    'Service 2': 'MCH'
  }
}, {
  'Services': 'MCH Other'
}, {
  'Services': 'MCH Other',
  'Other Services': 'Nutrition Counseling'
}]];

export default exInputForGroupBy;