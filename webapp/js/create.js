$(document).ready(function() {

    var databaseRef = new Firebase("https://c60app.firebaseio.com/");

    $( "#createbtn" ).click(function() {

    	var passwordText = $("#passwordinput").val();

    	var usersRef = databaseRef.child("users");

    	var pebbleID = $('#pidinput').val();
  		var nameText = $('#nameinput').val();
  		var emailText = $('#emailinput').val();
  		var phoneText = $('#phoneinput').val();
      var usernameText = $('#userinput').val();

  		usersRef.child(pebbleID).set({
  			name: nameText,
  			email: emailText,
  			phone: phoneText,
        username: usernameText,
        connections: "Connections"
			});

      var accountsRef = databaseRef.child("accounts");

      accountsRef.child(usernameText).set({
        password: passwordText,
        pebbleid: pebbleID
      });

      window.location.href = "index.html";
	});
});