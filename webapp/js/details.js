$(document).ready(function() {

  var databaseRef = new Firebase("https://c60app.firebaseio.com/");

  var pebbleID = window.location.hash.slice(1,window.location.hash.length);

  $.getJSON("https://c60app.firebaseio.com/users/" + pebbleID + ".json", function(result){
    $("#name-header").html(result.name);
    $("#phoneinput").val(result.phone);
    $("#emailinput").val(result.email);
  });

  $('#editbtn').click(function(){
    $( "#phoneinput" ).prop( "disabled", false );
    $( "#emailinput" ).prop( "disabled", false );
    $( "#savebtn" ).prop( "disabled", false );
  });

  $('#savebtn').click(function(){
    var userRef = databaseRef.child("users").child(pebbleID);
    userRef.update({email: $( "#emailinput" ).val(), phone: $( "#phoneinput" ).val()});

    $( "#phoneinput" ).prop( "disabled", true );
    $( "#emailinput" ).prop( "disabled", true );
    $( "#savebtn" ).prop( "disabled", true );
  });

  $('#logoutbtn').click(function(){
    window.location.href = "index.html"
  });

});