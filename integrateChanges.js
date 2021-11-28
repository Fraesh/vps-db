const updates = require("./lastUpdate.json");
let db = require("./vpsdb.json");
const fs = require("fs");
const sharp = require("sharp");
const { default: axios } = require("axios");
const puppeteer = require("puppeteer");

const puppeteerDownload = async (url, fileName) => {
  console.log("PUPPETEER: ", url);
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const response = await page.goto(url, {
      waitUntil: "networkidle2",
    });
    const file = await response.buffer();
    await sharp(file)
      .resize({ height: 700 })
      .webp({ quality: 50, reductionEffort: 6 })
      .toFile(`img/${fileName}.webp`, (err, info) => {
        if (err) throw new Error();
      });
    await browser.close();
    return true;
  } catch (e) {
    console.log("ERR: ", url);
    return false;
  }
};

const downloadAxios = async (url, fileName) => {
  try {
    console.log("AXIOS: ", url);
    const buffer = await axios.get(url, { responseType: "arraybuffer" });
    sharp(buffer.data)
      .resize({ height: 700 })
      .webp({ quality: 50, reductionEffort: 6 })
      .toFile(`img/${fileName}.webp`, (err, info) => {
        err && console.log(err);
      });
    return true;
  } catch (e) {
    console.log("ERR: ", url);
    return false;
  }
};

const download = async (imgUrl, fileName) => {
  let worked = await downloadAxios(imgUrl, fileName);
  if (!worked) {
    worked = await puppeteerDownload(imgUrl, fileName);
  }
  if (worked) {
    console.log("SCRAPED IMG: ", fileName);
    return `https://fraesh.github.io/vps-db/img/${fileName}.webp`;
  } else {
    console.log("BOTH FAILED");
  }
};

const getImages = async (el) => {
  if (el.imgUrl && !el.imgUrl.includes("fraesh.github.io")) {
    const fileName = `${el.id}_cover_${new Date().getTime()}`;
    const url = await download(el.imgUrl, fileName);
    if (url) {
      console.log("ADDED NEW URL", url);
      tb.imgUrl = url;
    }
  }

  if (el.tableFiles) {
    await Promise.all(
      el.tableFiles?.map(async (tb) => {
        if (tb.imgUrl && !tb.imgUrl.includes("fraesh.github.io")) {
          const fileName = `${el.id}_table_${new Date().getTime()}`;
          const url = await download(tb.imgUrl, fileName);
          if (url) {
            console.log("ADDED NEW URL", url);
            tb.imgUrl = url;
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
          const url = await download(tb.imgUrl, fileName);
          if (url) {
            console.log("ADDED NEW URL", url);
            tb.imgUrl = url;
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
