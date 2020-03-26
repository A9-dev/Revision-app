const {
  ipcRenderer
} = require("electron");

$(document).ready(function () {
  $("#card").draggable({
    opacity: 0.35,
    cursor: "grabbing",
    revert: true,
    revertDuration: 200,
    containment: "#body",
    scroll: false,

    start: function (event, ui) {
      $(this).draggable("instance").offset.click = {
        left: Math.floor(ui.helper.width() / 2),
        top: Math.floor(ui.helper.height() / 2)
      };
    }
  });
  $("#easy-drop").droppable({
    tolerance: "pointer",
    drop: function (event, ui) {
      // Executes this function when card is dropped on easy
      console.log("Dropped on Easy");
      // Increase card's confidence value by a quarter of the difference between it and 1
      let newConfidence = cards[currentCard].confidence + ((1 - cards[currentCard].confidence) / 4)
      saveConfidenceValues(`${currentDeckIndex},${newConfidence},${cards[currentCard].id}`);
      ipcRenderer.send("asynchronous-message", `incrementRevisionCount,${currentDeckIndex}`)
      // Change card to one with lowest confidence value
      updateCard("front")
    }
  });
  $("#medium-drop").droppable({
    tolerance: "pointer",
    drop: function (event, ui) {
      // Executes this function when card is dropped on medium
      console.log("Dropped on Medium");
      // Increase card's confidence value by a sixth of the difference between it and 1
      let newConfidence = cards[currentCard].confidence + ((1 - cards[currentCard].confidence) / 6)
      saveConfidenceValues(`${currentDeckIndex},${newConfidence},${cards[currentCard].id}`)
      ipcRenderer.send("asynchronous-message", `incrementRevisionCount,${currentDeckIndex}`)

      // Change card to one with lowest confidence value
      updateCard("front")
    }
  });
  $("#hard-drop").droppable({
    tolerance: "pointer",
    drop: function (event, ui) {
      // Executes this function when card is dropped on hard
      console.log("Dropped on Hard");
      // Decrease card's confidence value by a third of itself
      let newConfidence = cards[currentCard].confidence * 2 / 3


      saveConfidenceValues(`${currentDeckIndex},${newConfidence},${cards[currentCard].id}`)
      ipcRenderer.send("asynchronous-message", `incrementRevisionCount,${currentDeckIndex}`)

      // Change card to one with lowest confidence value
      updateCard("front")
    }
  });
});

var cards = [];
var currentDeckIndex = null;

function deckSelected(deckIndex) {
  currentDeckIndex = deckIndex
  // Call to the main process
  // Cards is an array including each record in the selected table
  updateCard("front")
}
var currentCard = "";

function updateCard(face) {
  cards = ipcRenderer.sendSync("get-all-cards", currentDeckIndex)
  // Get next card
  currentCard = findNextCard()
  if (face == "front") {
    // Update front of card
    document.getElementById("card").innerHTML = cards[currentCard].front;
  } else if (face == "back") {
    // Update back of card
    document.getElementById("card").innerHTML = cards[currentCard].back;
  }
}

function findNextCard() {
  let confidences = []
  // Create array of just the confidence values
  for (i = 0; i < cards.length; i++) {
    confidences.push(cards[i].confidence)
  }
  console.log(confidences);

  // Find the lowest confidence value
  lowestConfidence = confidences.sort()[0];
  console.log(lowestConfidence);
  // Find the card with that confidence value
  for (i = 0; i < cards.length; i++) {
    let cardConfidence = cards[i].confidence;
    if (cardConfidence == lowestConfidence) {
      cardToRevise = i;
    }
  }
  // Return that card's index
  return cardToRevise;
}

function saveConfidenceValues(parameters) {
  ipcRenderer.send("asynchronous-message", `saveConfidenceValues,${parameters}`)
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