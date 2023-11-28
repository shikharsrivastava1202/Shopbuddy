const express = require("express");
const cookieparser = require("cookie-parser");

const app = express();  

const errorMiddleware = require("./middleware/error");

app.use(express.json())
app.use(cookieparser)

// routes imports

const product = require("./routes/productRoute");
const user = require("./routes/userRoute");

app.use("/api/v1",product);
app.use("/api/v1",user);

// middleware for errors 

app.use(errorMiddleware);

module.exports = app

