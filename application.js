var map;
var moreInfo;
var markers = [];
$(document).ready(function(){
  //Bind ajax calls to show more info button
  $('body').on('click', '.more-info', function(event){
    event.preventDefault();
    moreInfo = {};
    var listItem = $(this).closest("li");
    if ($(listItem).children().length === 1){

    var idx = $('.place-list').children().index($(this).closest("li"));
    var place = places[idx];
    var placeId = place["place_id"];
    moreInfo.listItem = listItem;

    //Request more info and create div displaying it
    service.getDetails({placeId: placeId}, getMoreInfo);
    }
  })

  //Request initial information
  //===========================================================================
  $('#zip-form').on('submit', function(event){
    event.preventDefault();
    var zipCode = $(this).find(".zip-input").val();
    var placeQuery = $(this).find("select").val();
    var zipUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + zipCode + "&key="
    $.ajax({
      url: zipUrl,
      method: "get"
    }).done(function(response){
      var zipCoord = response.results[0]["geometry"]["location"]
      zoomOnZip(zipCoord);
      var request = {
        location: map.getCenter(),
        radius: '500',
        query: placeQuery
      }
      places = [];

      for (i in markers){
        markers[i].setMap(null);
        markers[i] = null;
      }
      markers = [];
      service = new google.maps.places.PlacesService(map);
      service.textSearch(request, placeMarkers);
    });
  })
})

//Helper methods
//===================================================================

var placeMarkers = function(response){
  // console.log(response[0]["geometry"]["location"]);
  $(".place-list").empty();
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
  // console.log(status);
  // console.log(place);
  if(status === "OK"){
    moreInfo.address = place.formatted_address;
    moreInfo.name = place.name;
    moreInfo.website = place.website;
    console.log(moreInfo);
    $(moreInfo.listItem).append("<div class='hidden'></div>");
    var div = $(moreInfo.listItem).find("div");
    div.append("<p>" + moreInfo.address + "</p>");
    div.append("<p><a href='" + moreInfo.website + "''>" + "Website" + "</a></p>");
    div.slideDown();
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
