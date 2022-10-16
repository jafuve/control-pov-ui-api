const app = require('./app')

const dotenv = require('dotenv');
// const { dbGetPool } = require('./models/connection3');

// Set config file
dotenv.config({ path: 'backend/config/config.env' })

app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${ process.env.PORT } in ${ process.env.NODE_ENV }`);
    // dbGetPool();
    //initializeDB().then( console.log(`DB initialized correctly.`) );
})