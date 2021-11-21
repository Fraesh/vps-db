const updates = require("./lastUpdate.json");
let db = require("./vpsdb.json");
const fs = require("fs");

const deleteGame = ({ id }) => {
  const index = db.findIndex((g) => g.id === id);
  if (index >= 0) {
    const el = db[index];
    console.log(`DELETE ${el.name}-${el.year}-${el.manufacturer}`);
    db.splice(index, 1);
  }
};

const createGame = ({ data }) => {
  db.push(data);
  console.log(`CREATE ${data.name}-${data.year}-${data.manufacturer}`);
};

const updateGame = ({ id, data }) => {
  const index = db.findIndex((g) => g.id === id);
  if (index >= 0) {
    console.log(`UPDATE ${data.name}-${data.year}-${data.manufacturer}`);
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
