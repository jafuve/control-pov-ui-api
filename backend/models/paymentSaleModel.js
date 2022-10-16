const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')

// Get cashbox flow records 
exports.getPaymentSaleRecords = async (from, to) => {

    return new Promise(async (resolve, reject) => {

        try {
            await dbConnect();

            const query = "SELECT id_record, id_subsidiary, is_closed, opened_by, closed_by, opened_datetime, closed_datetime, cash_initial, cash_sales, cash_incomes, card_sales, cash_outcome, cash_physical, comment FROM cashbox_flow";
            const queryParms = {};
    
            const resUsers = await dbQuery(query, queryParms);
            resolve(resUsers);    

        } catch (error) {
            reject(`[cashboxModel::getCashboxFlowRecords]: ${ error }`)
        }
        
    }); // END OF PROMISE

};

// Create customer
exports.createPaymentSaleRecord = async (data, pdo = null) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = (pdo == null) ? await dbGetPoolConnection( await dbGetPool() ) : pdo;
            
            const query = "INSERT INTO payment_sale(id_sale, datetime, cash_amount, card_amount, card_number, credit_note, credit_note_ref, check_amount, check_detail, id_user) VALUES (:id_sale, :datetime, :cash_amount, :card_amount, :card_number, :credit_note, :credit_note_ref, :check_amount, :check_detail, :id_user)";
            const queryParms = {
                id_sale: data.id_sale,
                datetime: new Date(),
                cash_amount: data.cash_amount,
                card_amount: data.card_amount,
                card_number: data.card_number,
                credit_note: data.credit_note,
                credit_note_ref: data.credit_note_ref,
                check_amount: data.check_amount,
                check_detail: data.check_detail,
                id_user: data.id_user
            };
            
            const resQuery = await dbQuery(query, queryParms, connection);
            console.log(resQuery)
            // return resQuery;
            resolve(resQuery);    

        } catch (error) {
            // return { success: false, message: `[customerModel::createPaymentSaleRecord]: ${ error }` }
            reject(`[paymentSaleModel::createPaymentSaleRecord]: ${ error }`)
        }
        
    }); // END OF PROMISE

};