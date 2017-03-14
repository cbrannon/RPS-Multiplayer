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

  // set variables for user reference, chat, turn, current players in session, player data from session, and opponent name;
   var database = firebase.database(),
      users = database.ref("users"),
      chat = database.ref("chat"),
      turn = database.ref("turn"),
      turnNumber = 1,
      currentPlayers = [],
      playerName = "",
      playerNumber = "",
      otherPlayer;

  users.on("value", getData, errData);
  chat.on("value", getChatData, errChatData);

  function getData(data) {
    // reset fields in case a player leaves
    resetNames();

    // update of player data
    var players = data.val(),
        otherPlayer;
    
    currentPlayers = Object.keys(players);

    if (currentPlayers.length != 2) {
      $(".button-choices").empty();
    }

    console.log(currentPlayers.length);

    setPlayer(players, currentPlayers);
  }

  function errData(err) {
    console.log(err);
  }

  function getChatData(data) {
    var log = data.val();
    var chatKeys = Object.keys(log);
    setChatData(log, chatKeys);
  }

  function setChatData(chat, chatKeys) {
    $("#chat-card").empty();
    for (var i = 0; i < chatKeys.length; i++) {
      var key = chatKeys[i];
      var name = chat[key].name;
      var message = chat[key].message;
      var messageStatus = chat[key].messageStatus;

      if (messageStatus == "leave") {
        $("#chat-card").prepend("<p><span class='player-left'>" + name + " " + message  +"</span></p>");
      } else {
        $("#chat-card").prepend("<p><span class='player" + playerNumber + "-chat'>" + name + "</span>: " + message + "</p>");
      }
    }
  }

  function errChatData(err) {
    console.log(err);
  }

  function setPlayer(players, currentPlayers) {
    if (currentPlayers.length > 0) {
      playerName = sessionStorage.getItem('name');
      playerNumber = sessionStorage.getItem('playerNumber');

      for (var i = 0; i < currentPlayers.length; i++) {
        var player = currentPlayers[i],
            name = players[player].name,
            playerNameId = "#player" + player + "-name",
            playerWinsId = "#player" + player + "-win-loss";
        
        $(playerNameId).text(name);
        $(playerWinsId).html("Wins: <span id='player" + player + "'>0</span> Losses: <span id='player" + player + "-losses'>0</span>");
      }

      if (currentPlayers.length == 2) {
        for (var i = 0; i < currentPlayers.length; i++) {
          if (currentPlayers[i] != playerName) {
            otherPlayer = currentPlayers[i];
          }
        }
        startGame();
      }
    }
  }

  function startGame() {
    console.log("Game Start");
    turn = 1;
    setButtons();
  }

  function setButtons() {
    var playerButtons = "#player" + playerNumber + "-rps-buttons";
    var buttonChoices = ["rock", "paper", "scissors"];

    for (var i = 0; i < buttonChoices.length; i++) {
      var button = $("<button>");
      var icon = $("<i>").addClass("fa fa-hand-" + buttonChoices[i] + "-o");
      var buttonId = "player" + playerNumber + "-" + buttonChoices[i];
      
      button
        .attr("id", buttonId)
        .attr("aria-hidden", "true")
        .addClass("mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect choices")
        .append(icon);
      
      $(playerButtons).append(button);
    }
  }

  function resetNames() {
    $("#player1-name").text("Waiting for Player 1");
    $("#player2-name").text("Waiting for Player 2");
    $(".wins-losses").empty();
  }


  function setUser(user) {
    if (currentPlayers.indexOf("1") == -1) {
      var playerNumber = 1;
    } else {
      var playerNumber = 2;
    }

    sessionStorage.setItem("playerNumber", playerNumber);
    sessionStorage.setItem("name", user);
    setUserDisplay(user, playerNumber);

    users.child(playerNumber).set({
      name: user,
      losses: 0,
      wins: 0
    });
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
    users.child(playerNumber).remove();
     chat.push({
        name: playerName,
        message: "has left the session.",
        messageStatus: "leave"
      });
  });

  $("#chat").on("click", function (event) {
    var newMessage = $("#chat-input").val();
    console.log(newMessage);

    if (sessionStorage.getItem("name") != null) {
        chat.push({
        name: playerName,
        message: newMessage,
        messageStatus: "new"
      });
    }
  });
});