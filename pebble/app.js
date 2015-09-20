var UI = require('ui');
var ajax = require('ajax');
var Vibe = require('ui/vibe');

require('./firebase'); 

// Firebase

var databaseRef = new Firebase('https://c60app.firebaseio.com/'); 
var usersRef = databaseRef.child('users');

var connections = [];

// Location

var templat = 0;
var templong = 0;

var menu;

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

function locationSuccess(pos) {
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);

  templat = pos.coords.latitude;
  templong = pos.coords.longitude;
  
  usersRef.child(Pebble.getAccountToken()).update({
    latitude: templat,
    longitude: templong
  });
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}

// Radius algorithm 
function radiusFinder(lat1, long1) {
  var latitude_other = lat1;
  var longitude_other = long1;
  var latitude_mine = templat;
  var longitude_mine = templong;

  var R = 6371000; // metres
  var φ1 = latitude_mine * (Math.PI/180);
  var φ2 = latitude_other * (Math.PI/180);
  var Δφ = (latitude_other-latitude_mine) * (Math.PI/180);
  var Δλ = (longitude_other-longitude_mine) * (Math.PI/180);

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;
  
  return d;
}

var contacts = [
  {
    title: 'Andrew Liang',
    subtitle: 'liangdrew@gmail.com',
    body: '647 216 3339'
  }, {
    title: 'Aman Dureja',
    subtitle: 'dureja.aman.97@outlook.com',
    body: '905 123 4446'
  }, {
    title: 'Paul Zhang',
    subtitle: 'p97zhangisawastemanfordayslololololwaterloose2020@hotmail.com',
    body: '905 323 4546',
  }, {
    title: 'Aditya Keerthi',
    subtitle: 'akeerth@uwaterloo.ca',
    body: '312 143 4476'
  }
];

var main = new UI.Card({  // app title screen
  title: '     C60',
  icon: 'images/c60.png',
  subtitle: 'Welcome!',
  body: 'Press select to continue.'
});

main.show();

main.on('click', 'select', function(e) {
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);

  menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Find Nearby!',
        icon: 'images/find.png',
        subtitle: 'Look for users'
      }, {
        title: 'Connections',
        icon: 'images/c60.png',
        subtitle: 'My network'
      }, {
        title: 'My Token',
        icon: 'images/token.png',
        subtitle: 'My Pebble ID'
      }]
    }]
  });  // closes menu
  
  menu.show();

  menu.on('select', function(e) 
  {
    if (e.itemIndex === 0) 
    {
      ajax(
        {
          url: 'https://c60app.firebaseio.com/users.json',
          type: 'json'
        },
        function(data) {
          // Success!
          
          var nearbyData = [];
          
          for (var key in data) {
            
            if (key !== Pebble.getAccountToken()){
              var otherlat = data[key].latitude;
              var otherlong = data[key].longitude;
              
              console.log(otherlat + " " + otherlong);
              
              var distance = radiusFinder(otherlat,otherlong);
              
              if (distance < 100){
                nearbyData.push({title: data[key].name, subtitle: data[key].username});
              }
              
              var nearby_menu = new UI.Menu({
                sections: [{
                  items: nearbyData
                }]
              });  // closes menu
              
              nearby_menu.show();
              
              nearby_menu.on('select', function(e) {
                console.log(nearbyData[e.itemIndex].subtitle);
                
                ajax(
                  {
                    url: 'https://c60app.firebaseio.com/accounts/' + nearbyData[e.itemIndex].subtitle + ".json",
                    type: 'json'
                  },
                  function(data, status, request) {
                    
                    usersRef.child(data["pebbleid"]).update({
                      invitation: Pebble.getAccountToken()
                    });
                    
                  },
                  function(error, status, request) {
                    console.log('The ajax request failed: ' + error);
                  }
                );
              });
              
            }
            
          }
          
        },
        function(error) {
          // Failure!
          console.log('Failed fetching data: ' + error);
        }
      );
    }
    
    if (e.itemIndex === 1)  // Connections
    {
      
      connections = [];
      
      
      ajax(
        {
          url: 'https://c60app.firebaseio.com/users/' + Pebble.getAccountToken() + "/connections.json",
          type: 'json'
        },
        function(data, status, request) {
          
          var num = Object.keys(data).length;
          var i = 0;
          
          while (true){
            if (i === num){
              
              setTimeout(connectionCard, 500);
              
              break;
            }
            
            ajax(
            {
              url: 'https://c60app.firebaseio.com/users/' + Object.keys(data)[i] + ".json",
              type: 'json'
              },
            function(data, status, request) {
              connections.push({title: data.name, subtitle: data.email, body: data.phone});
              },
            function(error, status, request) {
              console.log('The ajax request failed: ' + error);
              }
            );
            
            i++;
          }
        },
        function(error, status, request) {
          console.log('The ajax request failed: ' + error);
        }
      );
      

    }  // CLOSES IF
    
    else if (e.itemIndex === 2)  // Token
    {
      var token_card = new UI.Card
      ({
        title: 'Pebble ID',
        body: Pebble.getAccountToken()
      });  //  CLOSES VAR
      token_card.show();
    }  // CLOSES ELSE IF
  });  // CLOSES MENU.ON
  
});  // CLOSES MAIN.ON

function connectionCard(){
  var contact_menu = new UI.Menu
  ({
    sections: 
    [{
      title: 'Connections',
      items: connections
    }]
  });

  contact_menu.show();

  contact_menu.on('select', function(e) 
  {
    var detail_card = new UI.Card
    ({
        title: connections[e.itemIndex].title,
        subtitle: connections[e.itemIndex].subtitle,
        body: connections[e.itemIndex].body,
        scrollable: true
    });  // CLOSES VAR
    detail_card.show(); 
  }); //  CLOSES CONTACT_MENU.ON
}

function snapshot(dataSnapshot){
  if (dataSnapshot.key() === "invitation" || dataSnapshot.name() == "invitation"){
    
    if (dataSnapshot.val() === ""){
      return;
    }
    
    var inviteName = "";
    var inviteUsername = "";
    
    ajax(
      {
        url: 'https://c60app.firebaseio.com/users/' + dataSnapshot.val() + ".json",
        type: 'json'
      },
      function(data, status, request) {

        inviteName = data['name'];
        inviteUsername = data['username'];
        
        var notification_menu = new UI.Menu
          ({
            sections: 
            [{
              title: 'Invitation from:',
              items:
              [{
                title: inviteName,
                subtitle: inviteUsername
              }, {
                title: 'Accept',
                subtitle: 'Select to accept'
              }, {
                title: 'Decline',
                subtitle: 'Select to decline'
              }]
            }]
          });

          notification_menu.show();
          Vibe.vibrate('short');

          notification_menu.on('select', function(e) {
            if (e.itemIndex === 1) {
              // Add user to contacts (push to firebase)
              
              var connectionRef = usersRef.child(Pebble.getAccountToken()).child("connections");
              var temp = {}; 
              temp[dataSnapshot.val()] = dataSnapshot.val(); 
              connectionRef.update(temp);
              
              connectionRef = usersRef.child(dataSnapshot.val()).child("connections");
              temp = {}; 
              temp[Pebble.getAccountToken()] = Pebble.getAccountToken();
              connectionRef.update(temp);
              
              usersRef.child(Pebble.getAccountToken()).update({
                  invitation: ""
              });
              
              notification_menu.hide();
              menu.show();
            }
            else if (e.itemIndex === 2) {
              // Decline request
              
              usersRef.child(Pebble.getAccountToken()).update({
                  invitation: ""
              });
              
              notification_menu.hide();
              menu.show();
            }
          });
      },
      function(error, status, request) {
        console.log('The ajax request failed: ' + error);
      }
    );
  }
}

usersRef.child(Pebble.getAccountToken()).on("child_changed", snapshot);
usersRef.child(Pebble.getAccountToken()).on("child_added", snapshot);