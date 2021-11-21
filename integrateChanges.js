const updates = require("./lastUpdate.json");
let db = require("./vpsdb.json");
const fs = require("fs");

const deleteGame = ({ name, year, manufacturer }) => {
  const index = db.findIndex(
    (g) => g.name === name && g.year === year && g.manufacturer === manufacturer
  );
  if (index >= 0) {
    console.log(`DELETE ${name}-${year}-${manufacturer}`);
    db = db.splices(index, 1);
  }
};

const createGame = ({ data }) => {
  db.push(data);
  console.log(`CREATE ${data.name}-${data.year}-${data.manufacturer}`);
};

const updateGame = ({ name, year, manufacturer, data }) => {
  const index = db.findIndex(
    (g) => g.name === name && g.year === year && g.manufacturer === manufacturer
  );
  if (index >= 0) {
    console.log(`UPDATE ${name}-${year}-${manufacturer}`);
    db[i] = data;
  }
};

updates.forEach((update) => {
  switch (update.action) {
    case "DELETE":
      deleteGame(update);
      break;
    case "CREATE":
      createGame(update);
      break;
    case "UPDATE":
      updateGame(update);
      break;
    default:
      console.log("FAULTY ACTION");
  }
});

fs.writeFile("vpsdb.json", JSON.stringify(db), console.log);
