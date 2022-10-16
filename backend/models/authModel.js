const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')

// Create new product   =>   /api/v1/admin/product/new
exports.getUsers = async () => {

    return new Promise(async(resolve, reject) => {

        const connection = await dbGetPoolConnection( await dbGetPool() );

        const query = "SELECT id_user Id, name Name, surname Surname, username Username, is_active IsActive, id_user_role UserRoleId, last_login LastLogin, created_at CreatedAt, created_by CreatedBy FROM user";
        const queryParms = {};

        const resQuery = await dbQuery(query, queryParms, connection);
        resolve(resQuery)

    }); // END OF PROMISE

};

exports.attemptLogin = (username, password) => {
    
    return new Promise( async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );

            const passCrypted = `SHA( CONCAT( SHA( "${ username }" ), "${ password }" ) )`;

            let query = `SELECT id_user Id, name Name, surname Surname, username Username, is_active IsActive, id_user_role UserRoleId, last_login LastLogin, created_at CreatedAt, created_by CreatedBy FROM user where username= :username AND password = ${ passCrypted } LIMIT 1`;
            const queryParms = { username };

            const resAttemptLogin = await dbQuery(query, queryParms, connection);
            if(!resAttemptLogin.success){
                return reject({success: false, message: resAttemptLogin.message})
            }

            const users = resAttemptLogin.results;

            if(users.length <= 0){
                return resolve({
                    success: true,
                    authenticated: false,
                    message: "There are no coincidences with your username and password, try again."
                });
            } // END IF

            if(users[0].IsActive !== 1){
                resolve({
                    success: true,
                    authenticated: false,
                    message: "The desired user is no longer active."
                });
                return;
            }
            
            resolve({
                success: true,
                authenticated: true,
                user: users[0],
            });

        } catch (error) {
            reject(`[authModel::attemptLogin]: ${ error }`)
        }
        
    });

}; // END FUNCTION

// create cashbox flow record
exports.createUser = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );

            const passCrypted = `SHA( CONCAT( SHA( "${ data.username }" ), "${ data.password }" ) )`;
            const query = `INSERT INTO user(name, surname, username, password, is_active, id_user_role, last_login, created_at, created_by) VALUES (:name, :surname, :username, ${ passCrypted }, :is_active, :id_user_role, :last_login, :created_at, :created_by)`;
            const queryParms = {
                name: data.name,
                surname: data.surname,
                username: data.username,
                is_active: data.is_active,
                id_user_role: data.id_user_role,
                last_login: data.last_login,
                created_at: new Date(),
                created_by: data.created_by
            };
    
            const resCreate = await dbQuery(query, queryParms, connection);
            resolve(resCreate);    

        } catch (error) {
            reject(`[authModel::createUser]: ${ error }`)
        }
        
    }); // END OF PROMISE

};