const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')

// Get clients 
exports.getSuppliers = async () => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );

            const query = "SELECT id_supplier, name, nit, address, email, phone, is_active, contact_name, contact_email, contact_phone, credit_days, credit_limit, id_user FROM supplier";
            const queryParms = {};
    
            const resUsers = await dbQuery(query, queryParms, connection);
            resolve(resUsers);    

        } catch (error) {
            reject(`[customerModel::getSuppliers]: ${ error }`)
        }
        
    }); // END OF PROMISE

};

// Create supplier
exports.createSupplier = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );

            const query = "INSERT INTO supplier(name, nit, address, email, phone, is_active, contact_name, contact_email, contact_phone, credit_days, credit_limit, id_user) VALUES (:name, :nit, :address, :email, :phone, :is_active, :contact_name, :contact_email, :contact_phone, :credit_days, :credit_limit, :id_user)";
            const queryParms = {
                name: data.name,
                nit: data.nit,
                address: data.address,
                email: data.email,
                phone: data.phone,
                is_active: data.is_active,
                contact_name: data.contact_name,
                contact_email: data.contact_email,
                contact_phone: data.contact_phone,
                credit_days: data.credit_days,
                credit_limit: data.credit_limit,
                id_user: data.id_user
            };
    
            const resCreate = await dbQuery(query, queryParms, connection);
            resolve(resCreate);    

        } catch (error) {
            reject(`[customerModel::createSupplier]: ${ error }`)
        }
        
    }); // END OF PROMISE

};