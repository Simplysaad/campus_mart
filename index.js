const express = require("express");
const expressLayout = require("express-ejs-layouts");
const ejs = require("ejs");
const expressFileUpload = require("express-fileupload");
const dotenv = require("dotenv");
dotenv.config();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoStore = require("connect-mongo");
const connectDb = require("./server/Config/db.js");

//START APP
const app = express();
let PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`app is listening on http://localhost:${PORT}`);
});

//CONNECT DATABASE
connectDb();

app.use(expressFileUpload());

//SESSIONS INITIALIZING
app.use(
    session({
        secret: process.env.SECRET_KEY,
        store: mongoStore.create({
            mongoUrl: process.env.MONGO_URI
        }),
        saveUninitialized: false,
        resave: false,
        cookies: {
            maxAge: 3600000,
            secure: false
        }
    })
);

//VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", "views");

//LAYOUT
app.use(expressLayout);
app.set("layout", "layouts/main");

//LOAD STATIC FILES
app.use(express.static("PUBLIC"));

//PARSE req.body TO JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ROUTING
//app.use("/admin", require("./server/Routes/admin.js"));
app.use("/vendor", require("./server/Routes/vendor.js"));
app.use("/", require("./server/Routes/routes.js"));

