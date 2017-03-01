var map;
var moreInfo;
$(document).ready(function(){
  //Bind ajax calls to show more info
  $('body').on('click', '.more-info', function(event){
    event.preventDefault();
    moreInfo = "";
    var idx = $('.place-list').children().index($(this).closest("li"));
    var placeId = places[idx]["place_id"];
    var listItem = $(this).closest("li");
    var moreInfo = service.getDetails({placeId: placeId}, getMoreInfo);
  })



  $('#zip-form').on('submit', function(event){
    event.preventDefault();
    var zipCode = $(this).find(".zip-input").val();
    var zipUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + zipCode + "&key=YOUR_API_KEY"
    $.ajax({
      url: zipUrl,
      method: "get"
    }).done(function(response){
      var zipCoord = response.results[0]["geometry"]["location"]
      zoomOnZip(zipCoord);
      var request = {
        location: map.getCenter(),
        radius: '500',
        query: 'park'
      }
      places = [];
      markers = [];
      service = new google.maps.places.PlacesService(map);
      service.textSearch(request, placeMarkers);
    });
  })
})

var placeMarkers = function(response){
  // console.log(response[0]["geometry"]["location"]);
  for(var i in response){
    var place = response[i];
    var marker = new google.maps.Marker({
      position: response[i]["geometry"]["location"],
      map: map
    });
    // console.log(response[i])
    markers.push(marker);
    places.push(place);

    marker.addListener('click', function(){
      map.panTo(this.getPosition());
      map.setZoom(17);
      var idx = markers.indexOf(this);
      var placeId = places[idx]["place_id"];
      // service.getDetails({placeId: placeId}, getMoreInfo);
    })
    $('.place-list').append("<li class='place'>" + place["name"] +"<button class='more-info'>+</button></li>");
  }

}

var getMoreInfo = function(place, status){
  console.log(status);
  if(status === "OK"){
    return place
  }
}

var zoomOnZip = function(zipCoord){
  map.setCenter(zipCoord);
  map.setZoom(12);

  var marker = new google.maps.Marker({
    position: map.getCenter(),
    map: map
  });

  marker.addListener('click', function() {
    var zoom = map.getZoom();
    map.setZoom(zoom + 2);
    map.setCenter(marker.getPosition());
  });
}


function initMap() {
  //Create map
  var center = {lat: 0, lng: 0}
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 2
  });
}
