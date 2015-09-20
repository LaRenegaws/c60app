$(document).ready(function() {

    var databaseRef = new Firebase("https://c60app.firebaseio.com/");

    $( "#loginbtn" ).click(function() {

      var idText = $("#userinput").val();
    	var passwordText = $("#passwordinput").val();

    	$.getJSON("https://c60app.firebaseio.com/" + "accounts/" + idText + ".json", function(result){
        if (passwordText === result.password){
          console.log("TRUE");
          window.location.href = "details.html#" + result.pebbleid;
        }
      });

	});
});