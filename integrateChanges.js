const updates = require("./lastUpdate.json");
let db = require("./vpsdb.json");
const fs = require("fs");
const sharp = require("sharp");
const { default: axios } = require("axios");

const download = async (url, fileName) => {
  try {
    const buffer = await axios.get(url, { responseType: "arraybuffer" });
    sharp(buffer.data)
      .resize({ height: 700 })
      .webp({ quality: 50, reductionEffort: 6 })
      .toFile(`img/${fileName}.webp`, (err, info) => {
        console.log(err, info);
      });
    return true;
  } catch (e) {
    return false;
  }
};

const getImages = async (games) => {
  if (el.tableFiles) {
    await Promise.all(
      el.tableFiles?.map(async (tb) => {
        if (tb.imgUrl && !tb.imgUrl.includes("fraesh.github")) {
          const fileName = `${el.id}_table_${new Date().getTime()}`;
          const worked = await download(tb.imgUrl, fileName);
          console.log(fileName);
          if (worked) {
            tb.imgUrl = `https://fraesh.github.io/vps-db/img/${fileName}.webp`;
          }
        }
      })
    );
  }
  if (el.b2sFiles) {
    await Promise.all(
      el.b2sFiles?.map(async (tb) => {
        if (tb.imgUrl && !tb.imgUrl.includes("fraesh.github")) {
          const fileName = `${el.id}_b2s_${new Date().getTime()}`;
          const worked = await download(tb.imgUrl, fileName);
          console.log(fileName);
          if (worked) {
            tb.imgUrl = `https://fraesh.github.io/vps-db/img/${fileName}.webp`;
          }
        }
      })
    );
  }
};

// UPDATE DATABASE

const deleteGame = ({ id }) => {
  const index = db.findIndex((g) => g.id === id);
  if (index >= 0) {
    const el = db[index];
    console.log(`DELETE ${el.name}-${el.year}-${el.manufacturer}`);
    db.splice(index, 1);
  }
};

const createGame = async ({ data }) => {
  await getImages(data);
  db.push(data);
  console.log(`CREATE ${data.name}-${data.year}-${data.manufacturer}`);
};

const updateGame = async ({ id, data }) => {
  await getImages(data);
  const index = db.findIndex((g) => g.id === id);
  if (index >= 0) {
    console.log(`UPDATE ${data.name}-${data.year}-${data.manufacturer}`);
    db[index] = data;
  } else {
    db.push(data);
  }
};

const updateDatabase = async () => {
  await Promise.all(
    updates.map(async (update) => {
      switch (update.action) {
        case "DELETE":
          deleteGame(update);
          break;
        case "CREATE":
          await createGame(update);
          break;
        case "UPDATE":
          await updateGame(update);
          break;
        default:
          console.log("FAULTY ACTION");
      }
    })
  );
  fs.writeFile("vpsdb.json", JSON.stringify(db), console.log);
};

updateDatabase();
