const mysql = require('mysql');

async function getDBHandler() {
    try {
        const dbHandler = await open({
        filename: "database.sqlite",
        driver: sqlite3.Database,
        });

        if (!dbHandler)
        throw new TypeError(`DB Handler expected got: ${dbHandler}`);

        return dbHandler;
    } catch (error) {
        console.error(
        "There was an error trying to get the DB handler: ",
        error.message
        );
    }
}

async function initializeDB() {

    const con = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    });
    
    con.connect(function(err) {
        if (err) throw err;
        console.log("DB Connected Successfully!");
    });

}

module.exports = { initializeDB, getDBHandler };

