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
    turnNumber = 0,
    currentPlayers = [],
    playerName = "",
    playerNumber = "",
    otherPlayer,
    gameStart = false;
    player1Choice = "",
    player2Choice = "";

  var rockDisplay = $("<i>").addClass("fa fa-hand-rock-o");
  var paperDisplay = $("<i>").addClass("fa fa-hand-paper-o");
  var scissorsDisplay = $("<i>").addClass("fa fa-hand-scissors-o");

  database.ref().on("value", getData, errData);
  users.on("value", getUserData, errUserData);
  chat.on("value", getChatData, errChatData);
  turn.on("value", getTurnData, errTurnData);

  function getData(data) {
    // if no current players, clear chat data from database.
    if (data.val().users == null) {
      database.ref("chat").remove();
    }
  }

  function errData(data) {
    console.log(err);
  }

  function getUserData(data) {
    resetNames();
    var players = data.val(),
        otherPlayer;

    currentPlayers = Object.keys(players);

    if (currentPlayers.length != 2) {
      $(".button-choices").empty();
    }

    if (currentPlayers.length > 0) {
      setPlayer(players, currentPlayers);
    }
  }

  function errUserData(err) {
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

  function getTurnData(data) {
    turnNumber = data.val();
    $("#player1-turn").empty();
    $("#player2-turn").empty();
    if (turnNumber % 2 == 0) {
      $("#player1-turn").text("Waiting for other player to choose.");
      $("#player2-turn").text("It's your turn!");
    } else {
      $("#player2-turn").text("Waiting for other player to choose.");
      $("#player1-turn").text("It's your turn!");
    }

    if (turnNumber != 1 && turnNumber % 2 != 0) {
      showResults();
    }
  }

  function errTurnData(err) {
    console.log(err);
  }

  function setPlayer(players, currentPlayers) {
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

    if (currentPlayers.length == 2 && gameStart == false) {
      for (var i = 0; i < currentPlayers.length; i++) {
        if (currentPlayers[i] != playerName) {
          otherPlayer = currentPlayers[i];
        }
      }
      startGame();
    }
  }

  function startGame() {
    gameStart = true;
    turn.set(1);
    setButtons();
  }

  // set game buttons
  function setButtons() {
    $("#player1-rps-buttons").empty();
    $("#player2-rps-buttons").empty();
    $(".chosen").empty();
    var playerButtons = "#player" + playerNumber + "-rps-buttons";
    var buttonChoices = ["rock", "paper", "scissors"];

    for (var i = 0; i < buttonChoices.length; i++) {
      var button = $("<button>");
      var icon = $("<i>").addClass("fa fa-hand-" + buttonChoices[i] + "-o");
      
      button
        .attr("data-attribute",  buttonChoices[i])
        .attr("aria-hidden", "true")
        .addClass("mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect choices")
        .append(icon);
      
      $(playerButtons).append(button);
    }
  }

  function resetNames() {
    $("#player1-name").text("Waiting for 1");
    $("#player2-name").text("Waiting for 2");
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
      var turnId = "player" + playerNumber + "-turn";
      var turnContainer = $("<p>").attr("id", turnId).addClass("players-turn");
      $("#user-display")
      .append(welcomeText)
      .append(turnContainer);
  }

  function setChoices(ele, player) {
    var playerButtonsId = "#player" + player + "-rps-choice";

    switch (ele) {
        case "rock":
          console.log("rock");
          $(playerButtonsId).append(rockDisplay);
          break;
        
        case "paper":
          $(playerButtonsId).append(paperDisplay);
            break;

        case "scissors":
          $(playerButtonsId).append(scissorsDisplay);
            break;
      }
  }

  function showResults() {
    console.log(player1Choice);
    $(".chosen").empty();
    setTimeout ( setButtons, 3000 );
    console.log("results");
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
      turnNumber = 0;
      database.ref("turn").remove();
  });

  $("#chat").on("click", function (event) {
    var newMessage = $(".chatty").val();
    console.log(newMessage);

    if (sessionStorage.getItem("name") != null) {
        chat.push({
        name: playerName,
        message: newMessage,
        messageStatus: "new"
      });
    }
  });

  $(".button-choices").on("click", ".choices", function (event) {
    var ele = $(event.currentTarget).attr("data-attribute");

    if (playerNumber == 2 && turnNumber % 2 == 0) {

      $("#player2-rps-buttons").empty();
      setChoices(ele, playerNumber);

      users.child(playerNumber).update({
        choice: ele
      });

      console.log(ele);

      player2Choice = ele;
      turnNumber++;
      turn.set(turnNumber);

    } else if (playerNumber == 1 && turnNumber % 2 != 0) {

      $("#player1-rps-buttons").empty();
      setChoices(ele, playerNumber);

      users.child(playerNumber).update({
        choice: ele
      });

      console.log(ele);

      player1Choice = ele;
      turnNumber++;
      turn.set(turnNumber);
    }
  });
});