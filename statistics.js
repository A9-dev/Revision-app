const {
    ipcRenderer
} = require('electron')
ipcRenderer.send('asynchronous-message', 'getCounts')
var names = ipcRenderer.sendSync('get-table-names');
var counts = []
var cards = []
for (let i = 0; i < names.length; i++) {
    names[i] = names[i].slice(0, -5);
}
ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg);
    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < arg.length; j++) {
            if (arg[j].deckName == names[i]) {
                counts.push(arg[j].count)
            }
        }
        cards.push(ipcRenderer.sendSync("get-all-cards", i).length)
    }
    // TABLE GENERATION
    var table = document.getElementById("statsTable");
    for (let i = 0; i < names.length; i++) {
        // Create an empty <tr> element and add it to the 1st position of the table:
        var row = table.insertRow(i + 1);
        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);

        // Add some text to the new cells:
        cell1.innerHTML = names[i].slice(0, -5);
        cell2.innerHTML = counts[i];
        cell3.innerHTML = cards[i];
    }
    // GRAPH GENERATION
    var trace1 = {
        x: names,
        y: counts,
        type: 'bar',
        text: counts.map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        marker: {
            color: 'rgb(158,202,225)',
            opacity: 0.6,
            line: {
                color: 'rgb(8,48,107)',
                width: 1.5
            }
        }
    };

    var data = [trace1];

    var layout = {
        title: 'Total revisions',
        barmode: 'stack'
    };

    Plotly.newPlot('graphStatistics', data, layout);
})

function plotCounts() {
    var trace1 = {
        x: names,
        y: counts,
        type: 'bar',
        text: counts.map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        marker: {
            color: 'rgb(158,202,225)',
            opacity: 0.6,
            line: {
                color: 'rgb(8,48,107)',
                width: 1.5
            }
        }
    };

    var data = [trace1];

    var layout = {
        title: 'Total revisions',
        barmode: 'stack'
    };

    Plotly.react('graphStatistics', data, layout);
}

function plotCards() {
    var trace1 = {
        x: names,
        y: cards,
        type: 'bar',
        text: cards.map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        marker: {
            color: 'rgb(158,202,225)',
            opacity: 0.6,
            line: {
                color: 'rgb(8,48,107)',
                width: 1.5
            }
        }
    };
    var data = [trace1];

    var layout = {
        title: 'Number of cards',
        barmode: 'stack'
    };

    Plotly.react('graphStatistics', data, layout);
}