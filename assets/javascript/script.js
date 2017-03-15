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
    gameStart = false;

  // Player 1 data object to check locally.
  var player1Data = {
    name: "",
    choice: "",
    wins: 0,
    losses: 0
  }

  // Player 2 data object to check locally.
  var player2Data = {
    name: "",
    choice: "",
    wins: 0,
    losses: 0
  }

  // check for updates to root database, users, chat, and turns.
  database.ref().on("value", getData, errData);
  users.on("value", getUserData, errUserData);
  chat.on("value", getChatData, errChatData);
  turn.on("value", getTurnData, errTurnData);

  // remove chat items if no players currently in session
  function getData(data) {
    if (data.val().users == null) {
      database.ref("chat").remove();
    }
  }

  // log error if receive from database root reference value
  function errData(data) {
    console.log(err);
  }

  // if user data changes call this
  function getUserData(data) {
    resetNames();
    var players = data.val();
    currentPlayers = Object.keys(players);
    console.log("Current player length: " + currentPlayers.length);

    // if there are not two users stop game, reset data and remove text and buttons from DOM.
    if (currentPlayers.length != 2) {
      gameStart = false;
      $(".button-choices").empty();
      $("#player1-turn").empty();
      $("#player2-turn").empty();
      $(".players-turn").empty();
      turn.remove();
      resetWinsLosses(data);
    }

    // if there is a player in session add information to DOM.
    if (currentPlayers.length > 0) {
      setPlayer(players, currentPlayers);
    }

    // if there are two players check for answer given.
    if (currentPlayers.length == 2) {
      getChoices(players);
    }
  }

  // log error if received from user data value
  function errUserData(err) {
    console.log(err);
  }

  // call this if there is an update to chat data.
  function getChatData(data) {
    var log = data.val();
    var chatKeys = Object.keys(log);
    setChatData(log, chatKeys);
  }

  // if there is an update to chat data call this to place in DOM.
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

  // log if error received from chat data value.
  function errChatData(err) {
    console.log(err);
  }

  // call this if there is an update to turn count.
  function getTurnData(data) {
    turnNumber = data.val();
    console.log("turn value:" + turnNumber);
    setTurnDisplay();

    // Call showResults if odd turn, first turn is exception.
    if (turnNumber != 1 && turnNumber % 2 != 0 && currentPlayers.length == 2) {
      showResults();
    }
  }

  // set wins and losses to DOM.
  function setWinsLosses(player1Data, player2Data) {
    $("#player1-wins").text(player1Data.wins);
    $("#player1-losses").text(player1Data.losses);
    $("#player2-wins").text(player2Data.wins);
    $("#player2-losses").text(player2Data.losses);
  }

  // when turn is updated show each player whose turn it is.
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

  // call this if error received from turn database value.
  function errTurnData(err) {
    console.log(err);
  }

  // set up player information for the DOM.
  function setPlayer(players, currentPlayers) {
    playerName = sessionStorage.getItem('name');
    playerNumber = sessionStorage.getItem('playerNumber');

    for (var i = 0; i < currentPlayers.length; i++) {
      var player = currentPlayers[i],
          name = players[player].name,
          playerNameId = "#player" + player + "-name",
          playerWinsId = "#player" + player + "-win-loss";

      if (player == 1) {
        var playerData = player1Data;
      } else {
        var playerData = player2Data;
      }

      $(playerNameId).text(name);
      $(playerWinsId).html("Wins: <span id='player" + player + "-wins'>" + playerData.wins + "</span> Losses: <span id='player" + player + "-losses'>" + playerData.wins + "</span>");
    }

    // start game if two players in session
    if (currentPlayers.length == 2 && gameStart == false) {
      player1Data.name = players["1"].name;
      player2Data.name = players["2"].name;
      startGame();
    }
  }

  function setPlayerData(player) {
    
  }

  // start game, set turn and buttons.
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

  // reset name and wins-losses
  function resetNames() {
    $("#player1-name").text("Waiting for 1");
    $("#player2-name").text("Waiting for 2");
    $(".wins-losses").empty();
  }

  // reset game display information
  function resetGameDisplay() {
    $("#player1-rps-buttons").empty();
    $("#player2-rps-buttons").empty();
    $(".chosen").empty();
    $("#results-card").empty();
  }

  // reset wins and losses for if player leaves session
  function resetWinsLosses(data) {
    player1Data.wins = 0;
    player2Data.wins = 0;
    player1Data.losses = 0;
    player2Data.losses = 0;

    if (data.hasChild("1")) {
      users.child("1").update({
        wins: player1Data.wins,
        losses: player1Data.losses
      });
    }

    if (data.hasChild("2")) {
      users.child("2").update({
        wins: player1Data.wins,
        losses: player1Data.losses
      });
    }
  }

  // setup player when user puts information into input field
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

  // setup user display welcome notice and turn containers to DOM
  function setUserDisplay(user, playerNumber) {
      var welcomeText = $("<h4>").addClass("player-welcome").text("Hi, " + user + ". You are Player " + playerNumber + ".");
      var turnId = "player" + playerNumber + "-turn";
      var turnContainer = $("<p>").attr("id", turnId).addClass("players-turn");

      $("#user-display")
        .append(welcomeText)
        .append(turnContainer);
  }

  // shows user what choice they have selected to play
  function setChoices(ele, player) {
    var playerButtonsId = "#player" + player + "-rps-choice";
    $(playerButtonsId).append($("<i>").addClass("fa fa-hand-" + ele + "-o"));
  }

  // sets local player object choice property equal to database choice property
  function getChoices(player) {
    if (player["1"].choice !== undefined) {
      player1Data.choice = player["1"].choice;
    }
    
    if (player["2"].choice !== undefined){
      player2Data.choice = player["2"].choice;
    }
    console.log("Player 1 choice: " + player1Data.choice);
    console.log("Player 2 choice: " + player2Data.choice);
  }

  // evalute choices
  function evaluateResults(player1Choice, player2Choice) {
    var winner;
    if (player1Choice == player2Choice) {
      winner = "No one";
    }

    else if (player1Choice == "rock" && player2Choice == "scissors" 
     || player1Choice == "paper" && player2Choice == "rock" 
     || player1Choice == "scissors" && player2Choice == "paper") {
       winner = player1Data.name;
       player1Data.wins = player1Data.wins += 1;
       player2Data.losses = player2Data.losses += 1;

       users.child("1").update({
         wins: player1Data.wins
       });

       users.child("2").update({
         losses: player2Data.losses
       });

    } else {
       winner = player2Data.name;
       player2Data.wins = player2Data.wins += 1;
       player1Data.losses = player1Data.losses += 1;

       users.child("1").update({
         losses: player1Data.losses
       });

       users.child("2").update({
         wins: player2Data.wins
       });
    }
    setWinsLosses(player1Data, player2Data);
    $("#results-card").append("<h1>" + winner + " wins!</h1>");
    setTimeout ( setButtons, 5000 );
  }

  // show results of round
  function showResults() {
    if (currentPlayers.length == 2) {
      $(".chosen").empty();
      $(".players-turn").empty();
      $("#player1-rps-choice").append($("<i>").addClass("fa fa-hand-" + player1Data.choice +"-o"));
      $("#player2-rps-choice").append($("<i>").addClass("fa fa-hand-" + player2Data.choice +"-o"));
      evaluateResults(player1Data.choice, player2Data.choice);
    }
  }

  // submit new user name to play as
  $("#submit").on("click", function (event) {
    event.preventDefault();
    var newUser = $("#new-player-input").val();
    $("#new-player-input").val("");
    if (currentPlayers.length < 2) {
      $("#user-display").empty();
      setUser(newUser);
    }
  });

  // on refresh (in Chrome) and page close, kill current user from database.
  $(window).on("unload", function () {
    users.child(playerNumber).remove();
      chat.push({
        name: playerName,
        message: "has left the session.",
        messageStatus: "leave"
      });

      database.ref("turn").remove();
  });

  // submit message to chat
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

  // make a choice for round
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