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
    gameStart = false,
    player1Name = "",
    player2Name = "",
    player1Choice = "",
    player2Choice = "";

  var player1Data = {
    player1Name: "",
    player1Choice: "",
    player1Wins: "",
    player1Losses: ""
  }

  var player2Data = {
    player2Name: "",
    player2Choice: "",
    player2Wins: "",
    player2Losses: ""
  }

  var rockDisplay = $("<i>").addClass("fa fa-hand-rock-o");
  var paperDisplay = $("<i>").addClass("fa fa-hand-paper-o");
  var scissorsDisplay = $("<i>").addClass("fa fa-hand-scissors-o");

  database.ref().on("value", getData, errData);
  users.on("value", getUserData, errUserData);
  chat.on("value", getChatData, errChatData);
  turn.on("value", getTurnData, errTurnData);

  function getData(data) {
    if (data.val().users == null) {
      database.ref("chat").remove();
    }
  }

  function errData(data) {
    console.log(err);
  }

  function getUserData(data) {
    resetNames();
    var players = data.val();
    currentPlayers = Object.keys(players);

    if (currentPlayers.length != 2) {
      $(".button-choices").empty();
      $("#player1-turn").empty();
      $("#player2-turn").empty();
      turn.remove();
    }

    if (currentPlayers.length > 0) {
      setPlayer(players, currentPlayers);
      getChoices(players);
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
      let key = chatKeys[i];
      let name = chat[key].name;
      let message = chat[key].message;
      let messageStatus = chat[key].messageStatus;
      let playerNumber = chat[key].player_number;

      if (messageStatus == "leave") {
        $("#chat-card").append("<p><span class='player-left'>" + name + " " + message  +"</span></p>");
      } else {
        $("#chat-card").append("<p><span class='player" + playerNumber + "-chat'>" + name + "</span>: " + message + "</p>");
      }
    }
  }

  function errChatData(err) {
    console.log(err);
  }

  function getTurnData(data) {
    turnNumber = data.val();
    console.log("turn value:" + turnNumber);
    setTurnDisplay();

    if (turnNumber != 1 && turnNumber % 2 != 0) {
      showResults();
    }
  }

  function setTurnDisplay() {
    $("#player1-turn").empty();
    $("#player2-turn").empty();
    if (turnNumber % 2 == 0) {
      $("#player1-turn").text("Waiting for other player to choose.");
      $("#player2-turn").text("It's your turn!");
    } else {
      $("#player2-turn").text("Waiting for other player to choose.");
      $("#player1-turn").text("It's your turn!");
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
      player1Name = players["1"].name;
      player2Name = players["2"].name;
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
    setTurnDisplay();
    resetGameDisplay();
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

  function resetGameDisplay() {
    $("#player1-rps-buttons").empty();
    $("#player2-rps-buttons").empty();
    $(".chosen").empty();
    $("#results-card").empty();
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
    $(playerButtonsId).append($("<i>").addClass("fa fa-hand-" + ele + "-o"));
  }

  function getChoices(player) {
    if (player["1"].choice !== undefined) {
      player1Choice = player["1"].choice;
    }
    
    if (player["2"].choice !== undefined){
      player2Choice = player["2"].choice;
    }
    console.log("Player 1 choice: " + player1Choice);
    console.log("Player 2 choice: " + player2Choice);
  }

  function evaluateResults(player1Choice, player2Choice) {
    var winner;
    if (player1Choice == "rock" && player2Choice == "scissors" 
     || player1Choice == "paper" && player2Choice == "rock" 
     || player1Choice == "scissors" && player2Choice == "paper") {
       winner = player1Name;
       console.log("Player 1:");
    } else {
      winner = player2Name;
      console.log("Player 2 wins!");
    }
    $("#results-card").append("<h1>" + winner + " wins!</h1>");
    setTimeout ( setButtons, 5000 );
  }

  function showResults() {
    $(".chosen").empty();
    $("#player1-rps-choice").append($("<i>").addClass("fa fa-hand-" + player1Choice +"-o"));
    $("#player2-rps-choice").append($("<i>").addClass("fa fa-hand-" + player2Choice +"-o"));
    evaluateResults(player1Choice, player2Choice);
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
      database.ref("turn").remove();
  });

  $("#chat").on("click", function (event) {
    event.preventDefault();
    var newMessage = $(".chatty").val();

    if (sessionStorage.getItem("name") != null) {
        chat.push({
        name: playerName,
        player_number: playerNumber,
        message: newMessage,
        messageStatus: "new"
        });
      $(".chatty").val("");
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

      turnNumber++;
      turn.set(turnNumber);

    } else if (playerNumber == 1 && turnNumber % 2 != 0) {
      $("#player1-rps-buttons").empty();
      setChoices(ele, playerNumber);

      users.child(playerNumber).update({
        choice: ele
      });

      turnNumber++;
      turn.set(turnNumber);
    }
  });
});