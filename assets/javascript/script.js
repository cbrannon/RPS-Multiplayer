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
  var playerName = "";
  var playerNumber = "";

  players.on("value", getData, errData);

  function getData(data) {
    var players = data.val();
    currentPlayers = Object.keys(players);
    console.log(currentPlayers.length);

    playerName = sessionStorage.getItem('name');
    playerNumber = sessionStorage.getItem('playerNumber');

    console.log("Player name is: " + playerName);
    console.log("Player number is: " + playerNumber);
    
    if (currentPlayers.length > 0) {
      console.log(currentPlayers);
      for (var i = 0; i < currentPlayers.length; i ++) {}
    }

    // setDisplay(playerName, playerNumber);
  }

  function errData(err) {
    console.log(err);
  }

  function setDisplay() {
    console.log(players);
  }
  
  function setUser(user) {
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
    setUserDisplay(user, playerNumber);
    // getSession(player);

    players.child(playerNumber).set({
      name: user,
      losses: 0,
      wins: 0
    });
  }

  function getSession(player) {

  }

  function setUserDisplay(user, playerNumber) {
    var welcomeText = $("<p>").text("Hi, " + user + ". You are Player " + playerNumber);
     $("#user-display").append(welcomeText);
  }
 
  $("#submit").on("click", function (event) {
    event.preventDefault();
    var newUser = $("#new-player-input").val();
    $("#new-player-input").val("");
    if (currentPlayers.length < 2) {
      $("#user-display").empty();
      setUser(newUser);
    }
  });

  $(window).on("unload", function () {
    var currentPlayer = sessionStorage.getItem('playerNumber');
    players.child(currentPlayer).remove();
  });
});