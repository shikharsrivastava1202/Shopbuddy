const app = require("./app");

const dotenv = require("dotenv");

const connectdatabase = require("./config/database");

//handling uncaught exception

process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught Exception`);
    process.exit(1);
});



//config

dotenv.config({path:"backend/config/config.env"});

//connecting to database

connectdatabase();


const server = app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
});


//unhandled promise error

process.on("unhandledRejection", (err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);

    server.close(()=>{
        process.exit(1);
    });
});