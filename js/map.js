function initMap() {

  var styleArray = [
    {
      featureType: "all",
      stylers: [
        { saturation: -100 }
      ]
    }
  ];

  var mapDiv = document.getElementById('contact-map');
  if (!mapDiv) return;

  var LatLng = { lat: 37.551711, lng: 126.926116 };
  var LatLngMarker = { lat: 37.551711, lng: 126.926116 };

  var styledMap = new google.maps.StyledMapType(styleArray,
    {name: "Styled Map"});

  var map = new google.maps.Map(mapDiv, {
    zoom: 10,
    center: LatLng,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    },
    scrollwheel: false
  });

  var pin = document.querySelector('[data-pin]').dataset.pin;

  var marker = new google.maps.Marker({
    position: LatLngMarker,
    map: map,
    title: 'Broadband Convergence Lab, Building D, Computer Engineering Department, Hongik University, Sejong, South korea',
    icon: '' + pin
  });

  var infowindow = new google.maps.InfoWindow();

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');
}
