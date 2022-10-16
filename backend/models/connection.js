const mysql = require('mysql');

let pool;

const dbGetPool = async function(){
        
        if(pool){
            console.log("Pool from Singleton")
            return pool
        }

        pool = mysql.createPool({
            // connectionLimit: 1,  
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "fish_pov"
            // database: process.env.DB_NAME
        })

        console.log("Pool created")
        return pool;

} // END dbConnect

const dbGetPoolConnection = async function (pool){
    return new Promise((resolve, reject) => {

        pool.getConnection(function(error, connection) {
                
            if (error) { 
                console.log("rrreeerror")
                // return reject({success: false, message: err})
                return reject(error);
                // throw err; 
            }

            resolve(connection);

        });

    });
} // END 

const dbQuery = async function(query, queryParams = [], connection){

    return new Promise((resolve, reject) => {

        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return connection.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };

        const queryFormatted = connection.config.queryFormat(query, queryParams);

        connection.query(queryFormatted, queryParams, function (error, results, fields) {
        //     reject( {
        //     success: false,
        //     message: "test vaya"
        // })
            if (error){
                // console.log("errorsitos")
                return resolve( {
                    success: false,
                    message: `[dbQuery]: ${ error }`
                })
                // throw error;
            }
            
            return resolve( {
                success: true,
                results
            })
            
        // Neat!
        });

    });

} // END
module.exports = { pool, dbGetPoolConnection, dbQuery, dbGetPool }