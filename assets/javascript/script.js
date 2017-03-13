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

    resetNames();

    if (currentPlayers.length > 0) {
      playerName = sessionStorage.getItem('name');
      playerNumber = sessionStorage.getItem('playerNumber');

      for (var i = 0; i < currentPlayers.length; i++) {
        var player = currentPlayers[i];
        var name = players[player].name;
        var playerNameId = "#player" + player + "-name";
        var playerWinsId = "#player" + player + "-win-loss";
        $(playerNameId).text(name);
        $(playerWinsId).html("Wins: <span id='player" + player + "'>0</span> Losses: <span id='player" + player + "-losses'>0</span>");
      }
    }
  }

  function resetNames() {
    $("#player1-name").text("Waiting for Player 1");
    $("#player2-name").text("Waiting for Player 2");
    $("#player1-win-loss").empty();
    $("#player2-win-loss").empty();
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
    var welcomeText = $("<h4>").addClass("player-welcome").text("Hi, " + user + ". You are Player " + playerNumber);
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