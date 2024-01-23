//^ inports

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3030;

//! Database connection

mongoose.connect(process.env.DB_URI, {});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => {
    console.log("Database connected");
});

//~ Middlewere

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.use((req, res, next) => {
    res.locals.error = req.session.error;
    res.locals.success = req.session.success;
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;

    delete req.message;
    next();
});

app.use(express.static("uploads"));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

//* router

app.use("", require("./routes/routes"));

//? Start server :

app.listen(PORT, () => {
    console.log(`App listening on port http://localhost:${PORT}`);
});
