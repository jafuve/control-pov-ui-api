const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')

// Get cashbox flow records 
exports.getCashboxFlowRecords = async (from, to) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );

            const query = "SELECT id_record, id_subsidiary, is_closed, opened_by, closed_by, opened_datetime, closed_datetime, cash_initial, cash_sales, cash_incomes, card_sales, cash_outcome, cash_physical, comment FROM cashbox_flow WHERE opened_datetime BETWEEN :from AND :to ORDER BY opened_datetime ASC";
            const queryParms = {from, to};
    
            const resQuery = await dbQuery(query, queryParms, connection);
            
            resolve(resQuery);    

        } catch (error) {
            reject(`[cashboxModel::getCashboxFlowRecords]: ${ error }`)
        }
        
    }); // END OF PROMISE

};

// Get cashbox flow records 
exports.getLastCashboxFlowRecord = async (id_subsidiary) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );

            const query = "SELECT id_record, id_subsidiary, is_closed, opened_by, closed_by, opened_datetime, closed_datetime, cash_initial, cash_sales, cash_incomes, card_sales, cash_outcome, cash_physical, comment FROM cashbox_flow WHERE id_subsidiary = :id_subsidiary ORDER BY opened_datetime DESC LIMIT 1";
            const queryParms = { id_subsidiary };
    
            const resQuery = await dbQuery(query, queryParms, connection);
            resolve(resQuery);    

        } catch (error) {
            reject(`[cashboxModel::getLastCashboxFlowRecord]: ${ error }`)
        }
        
    }); // END OF PROMISE

};

// create cashbox flow record
exports.createCashboxFlowRecord = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );

            const query = "INSERT INTO cashbox_flow(id_subsidiary, is_closed, opened_by, closed_by, opened_datetime, closed_datetime, cash_initial, cash_sales, cash_incomes, card_sales, cash_outcome, cash_physical, comment) VALUES (:id_subsidiary, :is_closed, :opened_by, :closed_by, :opened_datetime, :closed_datetime, :cash_initial, :cash_sales, :cash_incomes, :card_sales, :cash_outcome, :cash_physical, :comment)";
            const queryParms = {
                id_subsidiary: data.id_subsidiary,
                is_closed: data.is_closed,
                opened_by: data.opened_by,
                closed_by: data.closed_by,
                opened_datetime: new Date(),
                closed_datetime: data.closed_datetime,
                cash_initial: data.cash_initial,
                cash_sales: data.cash_sales,
                cash_incomes: data.cash_incomes,
                card_sales: data.card_sales,
                cash_outcome: data.cash_outcome,
                cash_physical: data.cash_physical,
                comment: data.comment
            };
    
            const resCreate = await dbQuery(query, queryParms, connection);
            resolve(resCreate);    

        } catch (error) {
            reject(`[cashboxModel::createCashboxFlowRecord]: ${ error }`)
        }
        
    }); // END OF PROMISE

};

// create cashbox flow record
exports.updateCashboxFlowRecord = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );
            
            const query = "UPDATE cashbox_flow SET is_closed = :is_closed, closed_by = :closed_by,closed_datetime= :closed_datetime, cash_sales = :cash_sales, cash_incomes = :cash_incomes,card_sales = :card_sales, cash_outcome = :cash_outcome, cash_physical = :cash_physical, comment = :comment WHERE id_record = :id_record LIMIT 1";
            const queryParms = {
                is_closed: data.is_closed,
                closed_by: data.closed_by,
                closed_datetime: new Date(),
                cash_sales: data.cash_sales,
                cash_incomes: data.cash_incomes,
                card_sales: data.card_sales,
                cash_outcome: data.cash_outcome,
                cash_physical: data.cash_physical,
                comment: data.comment,
                id_record: data.id_record
            };
    
            const resQuery = await dbQuery(query, queryParms, connection);
            resolve(resQuery);    
            console.log(resQuery)
        } catch (error) {
            reject(`[cashboxModel::updateCashboxFlowRecord]: ${ error }`)
        }
        
    }); // END OF PROMISE

};
