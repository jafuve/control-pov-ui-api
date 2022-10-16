const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')

// Get clients 
exports.getCustomers = async () => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "SELECT id_customer, name, trade_name, address, nit, email, phone, is_active, contact_name, contact_phone, contact_email, credit_days, credit_limit FROM customer";
            const queryParms = {};

            const resQuery = await dbQuery(query, queryParms, connection);
            resolve(resQuery);

        } catch (error) {
            reject(`[customerModel::getCustomers]: ${error}`)
        }

    }); // END OF PROMISE

};

// Create customer
exports.createCustomer = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "INSERT INTO customer(name, trade_name, address, nit, email, phone, is_active, contact_name, contact_phone, contact_email, credit_days, credit_limit, created_at, id_user) VALUES (:name, :trade_name, :address, :nit, :email, :phone, :is_active, :contact_name, :contact_phone, :contact_email, :credit_days, :credit_limit, :created_at, :id_user)";
            const queryParms = {
                name: data.name,
                trade_name: data.trade_name,
                address: data.address,
                nit: data.nit,
                email: data.email,
                phone: data.phone,
                is_active: data.is_active,
                contact_name: data.contact_name,
                contact_phone: data.contact_phone,
                contact_email: data.contact_email,
                credit_days: data.credit_days,
                credit_limit: data.credit_limit,
                created_at: new Date(),
                id_user: data.id_user,
            };

            const resCreate = await dbQuery(query, queryParms, connection);
            resolve(resCreate);

        } catch (error) {
            reject(`[customerModel::getCustomers]: ${error}`)
        }

    }); // END OF PROMISE

};




