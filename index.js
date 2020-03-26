require("electron-reload")(__dirname);
const fs = require("fs");

const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
var path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "lmfao.png",
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile("index.html");
  // Open the DevTools.
  // win.webContents.openDevTools();
  win.maximize();
  win.setMenu(null);
  win.show();

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

const db = require("electron-db");

ipcMain.on("asynchronous-message", (event, arg) => {
  console.log(`Message recieved: ${arg}`);
  arg = arg.split(",");
  if (arg[0] == "createDeckTable") {
    createDeckTable(arg[1]);
    addTableToCounts(arg[1])
  } else if (arg[0] == "addCard") {
    // Adding a new card
    // Constructing object with fields of-
    // Front, back and confidence which defaults at 0.5
    let obj = new Object();
    obj.front = arg[1];
    obj.back = arg[2];
    obj.confidence = 0.5;
    // Getting just "test" from "test.json" for example
    try {
      let deckName = tables[arg[3]].slice(0, -5)
      // Inserting object into table
      if (db.valid(deckName, testFolder)) {
        db.insertTableContent(deckName, testFolder, obj, (succ, msg) => {
          // succ - boolean, tells if the call is successful
          console.log("Success: " + succ);
          console.log("Message: " + msg);
        })
      }
    } catch (err) {
      console.log("Select deck before adding a card");

    }
  } else if (arg[0] == "updateCard") {

    let where = {
      "front": arg[3],
      "back": arg[4]
    };

    let set = {
      "front": arg[1],
      "back": arg[2]
    }
    let deckName = tables[arg[5]].slice(0, -5)
    db.updateRow(deckName, testFolder, where, set, (succ, msg) => {
      // succ - boolean, tells if the call is successful
      console.log("Success: " + succ);
      console.log("Message: " + msg);
    });
  } else if (arg[0] == "saveConfidenceValues") {
    let where = {
      "id": parseInt(arg[3])
    };

    let set = {
      "confidence": parseFloat(arg[2])
    }

    db.updateRow(tables[arg[1]].slice(0, -5), where, set, (succ, msg) => {
      // succ - boolean, tells if the call is successful
      console.log("Success: " + succ);
      console.log("Message: " + msg);
    });
  } else if (arg[0] == "incrementRevisionCount") {

    db.getRows('revisionCount', testFolder, {
      deckName: tables[arg[1]].slice(0, -5)
    }, (succ, result) => {
      // succ - boolean, tells if the call is successful
      console.log("Success: " + succ);
      var currentCount = result[0].count;
      let where = {
        "deckName": tables[arg[1]].slice(0, -5)
      };
      let set = {
        "count": currentCount + 1
      }
      db.updateRow('revisionCount', testFolder, where, set, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        console.log("Success: " + succ);
        console.log("Message: " + msg);
      });
    })

  } else if (arg[0] == "getCounts") {
    db.getAll('revisionCount', testFolder, (succ, data) => {
      // succ - boolean, tells if the call is successful
      // data - array of objects that represents the rows.
      event.reply('asynchronous-reply', data)
    })
  }
});

function createDeckTable(name) {
  db.createTable(name, (succ, msg) => {
    // succ - boolean, tells if the call is successful
    console.log("Success: " + succ);
    console.log("Message: " + msg);
  });
}
const testFolder = path.join(process.env.APPDATA, "revision-app");

// Folder with the tables in

var tables = [];

function getTables() {
  tables = [];
  // Retrieving the json files
  fs.readdirSync(testFolder).forEach(file => {
    if (file.slice(-5) == ".json") {
      tables.push(file);
    }
  });
  // Returning the json files as an array
  var index = tables.indexOf("revisionCount.json");
  if (index !== -1) tables.splice(index, 1);

  return tables;
}
ipcMain.on("get-table-names", (event, arg) => {
  event.returnValue = getTables();
});
ipcMain.on("get-cards", (event, arg) => {
  // Get fronts
  db.getField(tables[arg].slice(0, -5), testFolder, "front", (succ, data) => {
    if (succ) {
      fronts = data;
    }
  })
  // Get backs
  db.getField(tables[arg].slice(0, -5), testFolder, "back", (succ, data) => {
    if (succ) {
      backs = data;
    }
  })
  // Create 2D array with the front and back arrays
  var cards = [fronts, backs];
  // Return it
  event.returnValue = cards;
});
ipcMain.on("get-all-cards", (event, arg) => {
  if (typeof tables[arg] !== "undefined") {
    db.getAll(tables[arg].slice(0, -5), testFolder, (succ, data) => {
      // succ - boolean, tells if the call is successful
      // data - array of objects that represents the rows.
      event.returnValue = data;
    })
  } else {
    event.returnValue = null;
  }
})

db.createTable('revisionCount', (succ, msg) => {
  // succ - boolean, tells if the call is successful
  console.log("Success: " + succ);
  console.log("Message: " + msg);
})

function addTableToCounts(tableName) {
  let obj = new Object();
  obj.deckName = tableName;
  obj.count = 0;
  if (db.valid('revisionCount', testFolder)) {
    db.insertTableContent('revisionCount', testFolder, obj, (succ, msg) => {
      // succ - boolean, tells if the call is successful
      console.log("Success: " + succ);
      console.log("Message: " + msg);
    })
  }
}
ipcMain.on("get-card-number", (event, arg) => {
  db.getAll(arg, testFolder, (succ, data) => {
    event.returnValue = data.length;
  })
})
