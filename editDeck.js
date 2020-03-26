const {
    ipcRenderer
} = require("electron");

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
var cards = [];

function deckSelected(deck) {
    currentDeck = deck; //Index of the deck
    // Stock list with cards
    cards = getCards(currentDeck);
    var cardEntries = "";
    // Iterates through the cards
    for (i = 0; i < cards[0].length; i++) {
        // And adds a list item per card using its front and back faces
        cardEntries = cardEntries + `<a class="list-group-item list-group-item-action" href="#" onclick="cardSelected(${i})">${cards[0][i]}, ${cards[1][i]}</li>`
    }
    // Committing the changes to the list
    document.getElementById("addCardsHere").innerHTML = cardEntries;
}
var currentCard = null;

function cardSelected(index) {
    // Set global variable to the index of the currently selected card
    currentCard = index;
    // Set the text boxes to have the text of the selected card
    document.getElementById("frontTextInput").innerHTML = cards[0][index];
    document.getElementById("backTextInput").innerHTML = cards[1][index];
}

function getCards(deckName) {
    return ipcRenderer.sendSync("get-cards", deckName)
}

function saveCard() {
    // Get front and back text
    let newFront = document.getElementById("frontTextInput").value
    let newBack = document.getElementById("backTextInput").value
    // If they aren't blank
    if (newFront != "" && newBack != "") {
        // New front face, new back face, old front face, old back face, the current deck index
        ipcRenderer.send("asynchronous-message", `updateCard,${newFront},${newBack},${cards[0][currentCard]},${cards[1][currentCard]},${currentDeck}`)
        deckSelected(currentDeck)
    } else {
        console.log("One of the inputs were blank");
    }
}

function filterList() {
    var filterText = document.getElementById("filterText").value
    var cardEntriesFiltered = "";
    // Iterates through the cards
    for (i = 0; i < cards[0].length; i++) {
        // And adds a list item per card using its front and back faces IF it includes the filterText
        if (cards[0][i].toLowerCase().includes(filterText.toLowerCase()) || cards[1][i].toLowerCase().includes(filterText.toLowerCase()))
            cardEntriesFiltered = cardEntriesFiltered + `<a class="list-group-item list-group-item-action" href="#" onclick="cardSelected(${i})">${cards[0][i]}, ${cards[1][i]}</li>`
    }
    // Committing the changes to the list
    document.getElementById("addCardsHere").innerHTML = cardEntriesFiltered;


}
