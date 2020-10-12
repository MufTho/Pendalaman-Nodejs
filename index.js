import dotenv from "dotenv";
dotenv.config();

import express from "express";
import hbs from "hbs";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import fs from "fs";

import { initDatabase, initTable, insertProduct } from "./database.js";

const __dirname = path.resolve();

const app = express();
const db = initDatabase;
initTable(db);

app.set("views", __dirname + "/layouts");
app.set("view engine", "html");
app.engine("html", hbs.__express);

// Use file parse
app.use(fileUpload());

// logic income request
app.use(morgan("combined"));

// parse request body
app.use(bodyParser.urlencoded());

// server static
app.use("/assets", express.static(__dirname + "/assets"));
app.use("/files", express.static(__dirname + "/files"));

app.get("/", (req, res, next) => {
  res.send({ success: true });
});

app.get("/product", (req, res, next) => {
  res.render("product");
});

// GET product list
app.get("/product", async (req, res, next) => {
  // getPoduct(db)
  //   .then((product) => {
  //     console.log("Product Result", product);
  //     res.render("product");
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  let products;
  try {
    products = await getPoduct(db);
  } catch (error) {
    return next(error);
  }

  console.log("Product Result", products);
  res.render("product", { products });
});

// Handle from GET Method
app.get("/add-product", (req, res, next) => {
  res.send(req.query);
});
// Handle from POST Method
app.post("/add-product", (req, res, next) => {
  console.log("Request", req.body);
  console.log("file", req.files);

  // Get Filename
  const fileName = Date.Now() + req.files.photo.name;

  // write file
  fs.writeFile(
    path.join(__dirname, "/files/", fileName),
    req.files.photo.data,
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
  // insert product
  insertProduct(
    db,
    req.body.name,
    parseInt(req.body.price),
    `/files/${fileName}`
  );

  // redirect
  req.redirect("/product");
});

app.use((err, req, res, next) => {
  res.send(err.message);
});

// use port enviroment
app.listen(process.env.PORT, () => {
  console.log(`App listen on port ${process.env.PORT}`);
});
