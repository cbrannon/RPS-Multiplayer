$(document).ready(function () {
  sessionStorage.clear();
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCBUxeKmwRxOa2PW7b__awpX2kEqcblEvw",
    authDomain: "rps-multiplayer-ef7e3.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-ef7e3.firebaseio.com",
    storageBucket: "rps-multiplayer-ef7e3.appspot.com",
    messagingSenderId: "578992449168"
  };
  firebase.initializeApp(config);

  var database = firebase.database();
  var players = database.ref("users");
  var currentPlayers = [];

  players.on("value", getData, errData);

  function getData(data) {
    var players = data.val();
    currentPlayers = Object.keys(players);
    console.log(Object.keys(players));
  }

  function errData(err) {
    console.log(err);
  }
  
  function setUser(user) {
    $("#user-display").empty();
    var playerNumber;
    // if player 1 is available
    console.log(currentPlayers);
    if (currentPlayers.indexOf("1") == -1) {
      playerNumber = 1;
    } else {
      playerNumber = 2;
    }

    sessionStorage.setItem("playerNumber", playerNumber);
    sessionStorage.setItem("name", user);

    players.child(playerNumber).set({
      name: user,
      losses: 0,
      wins: 0
    });

  }
 

  $("#submit").on("click", function (event) {
    event.preventDefault();
    var newUser = $("#new-player-input").val();
    $("#new-player-input").val("");
    if (currentPlayers.length < 2) {
      setUser(newUser);
    }
  });

  $(window).on("unload", function () {
    var currentPlayer = sessionStorage.getItem('playerNumber');
    players.child(currentPlayer).remove();
  });
});