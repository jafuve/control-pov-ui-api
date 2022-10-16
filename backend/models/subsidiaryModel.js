const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')

exports.getSubsidiaries = async () => {

    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection( await dbGetPool() );

            const query = "SELECT id_subsidiary, id_warehouse, name, address, country, department, nit, phone, email, path_logo, is_active, cashbox_independent, created_at, id_user FROM subsidiary";
            const queryParms = {};
    
            const resQuery = await dbQuery(query, queryParms, connection);
            
            if(!resQuery.success){
                return resolve({ success: false, message: resQuery.message })
            }

            resolve(resQuery);    

        } catch (error) {
            reject(`[subsidiaryModel::getSubsidiaries]: ${ error }`)
        }
        
    }); // END OF PROMISE

};

exports.getSubsidiary = async (id_subsidiary) => {

    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection( await dbGetPool() );

            const query = "SELECT id_subsidiary, id_warehouse, name, address, country, department, nit, phone, email, path_logo, is_active, cashbox_independent, created_at, id_user FROM subsidiary WHERE id_subsidiary = :id_subsidiary LIMIT 1";
            const queryParms = {id_subsidiary};
    
            const resQuery = await dbQuery(query, queryParms, connection);

            if(!resQuery.success){
                return resolve({ success: false, message: resQuery.message })
            }
            
            if(resQuery.results.length <= 0){
                return resolve({ success: false, message: `No se ha podido obtener la sucursal con el identificador indicado` })
            }
            
            resolve(resQuery);    

        } catch (error) {
            reject(`[customerModel::getSubsidiary]: ${ error }`)
        } finally{
            
        }
        
    }); // END OF PROMISE

};
