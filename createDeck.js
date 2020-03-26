const {
  ipcRenderer
} = require("electron");

function createDeck() {
  var deckName = document.getElementById("deckNameInput").value;

  if (deckName != "") {
    ipcRenderer.send("asynchronous-message", `createDeckTable,${deckName}`);
    refreshDecks();
  } else {
    console.log("Empty deck name");
  }
  document.getElementById("deckNameInput").value = "";
}


function refreshDecks() {
  var entries = "";

  var tableNames = ipcRenderer.sendSync("get-table-names", "ping");

  for (i = 0; i < tableNames.length; i++) {
    entries =
      entries +
      `<a class="dropdown-item" href="#" onclick="deckSelected(${i})">${tableNames[i]}</a>`;
  }

  document.getElementById("addTablesHere").innerHTML = entries;

}
refreshDecks();

var currentDeck = "";

function deckSelected(deck) {
  currentDeck = deck;
}

function addCard() {
  let front = document.getElementById("frontTextInput").value
  let back = document.getElementById("backTextInput").value
  if (front != "" && back != "") {
    ipcRenderer.send("asynchronous-message", `addCard,${front},${back},${currentDeck}`)
  } else {
    console.log("One of the inputs were blank");
  }
  console.log(front + back);
}
