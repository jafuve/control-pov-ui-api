const { dbConnect, dbQuery } = require('./connection')
const PaymentSale = require('../models/paymentSaleModel');
const Subsidiary = require('../models/subsidiaryModel');

// Get clients 
exports.getSaleRecords = async (from, to) => {

        try {
            // await dbConnect();
            
            const query = "SELECT id_record, id_subsidiary, is_closed, opened_by, closed_by, opened_datetime, closed_datetime, cash_initial, cash_sales, cash_incomes, card_sales, cash_outcome, cash_physical, comment FROM cashbox_flow";
            const queryParms = {};
    
            const { success, results, message } = await dbQuery(query, queryParms);
            
            if(!success){
                return {
                    success,
                    message: `[saleModel::getSaleRecords]: ${ message }`
                }    
            }
            
            return {
                success,
                data: results
            }

        } catch (error) {
            return { success: false, message: `[saleModel::getSaleRecords]: ${ error.message }`}
            // reject(`[saleModel::getSaleRecords]: ${ error }`)
        }
        

};

// Create customer
exports.handleCreateSale = async (data) => {
    
    try{
        const { pool } = await dbConnect();
        
        const { success, message, id_sale } = await createSaleTransaction(data, pool);

        // await dbClose();

        // console.log(success, id_sale)
        if(!success){
            return {
                success,
                message: `[saleModel::handleCreateSale(1)]: ${ message }`
            }  
        }

        return {
            success,
            message,
            id_sale
        }  

    } catch (error) {
        console.log("catch",error)
        return { success: false, message: `[saleModel::handleCreateSale(2)]: ${ error.message }`}
        // reject(`[saleModel::getSaleRecords]: ${ error }`)
    }
};

exports.handleCreateSale2 = async (data) => {
    
    try{
        const { connection } = await dbConnect();
        
        const { success, message, id_sale } = await createSaleTransaction(data, connection);

        // await dbClose();

        // console.log(success, id_sale)
        if(!success){
            return {
                success,
                message: `[saleModel::handleCreateSale]: ${ message }`
            }  
        }

        return {
            success,
            message,
            id_sale
        }  

    } catch (error) {
        return { success: false, message: `[saleModel::handleCreateSale]: ${ error.message }`}
        // reject(`[saleModel::getSaleRecords]: ${ error }`)
    }
};

const createSaleTransaction = async (data, pool) => {
    try {
    
    return new Promise((resolve, reject) => {

        pool.getConnection(function(error, connection) {
            
            if (error) { 
                return reject({success: false, message: err})
                // throw err; 
            }
            
            connection.beginTransaction(async function(err) {
                if (err) { 
                    return reject({success: false, message: err})
                    // throw err; 
                }
                
                // CREATE SALE
                const resCreateSale = await createSale(data);
                // console.log("resCreateSale", resCreateSale)
                
                if(!resCreateSale.success){
                    return connection.rollback(function() {
                        // throw err;
                        reject({success: false, message: resCreateSale.message})
                    });
                }
                const new_id_sale = resCreateSale.results.insertId;
                
                // GET WAREHOUSE OF SUBSIDIARY
                const resSubsidiary = await Subsidiary.getSubsidiary(data.id_subsidiary);
                if(!resSubsidiary.success){
                    return connection.rollback(function() {
                        // throw err;
                        reject({success: false, message: resSubsidiary.message})
                    });
                }
                
                const id_warehouse = resSubsidiary.results[0].id_warehouse;
                console.log("id_warehouse", id_warehouse)

                // CREATE SALE DETAIL
                // for(let i = 0; i < data.detail.length; i++){
                //     data.detail[i].id_sale = new_id_sale;
                //     const resCreateDetail = await createSaleDetail(data.detail[i]);

                //     if(!resCreateDetail.success){
                //         return connection.rollback(function() {
                //             // throw err;
                //             reject({success: false, message: resCreateDetail.message})
                //         });
                //     }

                    // VERIFY PRODUCT STOCK IN WAREHOUSE

                    //TODO: MODIFY WAREHOUSE STOCK

                // } // END FOR

                // INSERT INTO PAYMENT IF CONTADO
                // const resPayment = PaymentSale.createPaymentSaleRecord(data.detail.payment);
                // if(!resPayment.success){
                //     return connection.rollback(function() {
                //         // throw err;
                //         reject({success: false, message: resPayment.message})
                //     });
                // }

                // 

                // TEST QUERY
                // const resTest = await queryTest();

                // if(!resTest.success){
                //     return connection.rollback(function() {
                //         // throw err;
                //         reject({success: false, message: resTest.message})
                //     });
                // }
                
                // const query = "Select * from user";
                // const queryParams = {};
                
                // const resQuery1 = await dbQuery(query, queryParams);
                
                // if(!resQuery1.success){
                //     return connection.rollback(function() {
                //         // throw error;
                //             reject({success: false, message: `[saleModel::createSaleTransaction]: ${ message }`})
                //         });
                // }
                
                connection.commit(function(error) {
                    if (error) {
                        return connection.rollback(function() {
                            // throw err;
                            reject({success: false, message: error})
                        });
                    }
                });
                
                resolve({success: true, id_sale : resCreateSale.results.insertId,  message: `Venta creada con éxito.`})
                
            });

        });

    }); // END PROMISE

} catch (error) {
    console.log("otro")
    reject(error);
}
    

}; // END createSaleTransaction

const createSale = async (data) => {
    
    const query = "INSERT INTO product_sale(id_customer, datetime, client_name, amount, disscount, utility, total, expiration_date, payed, outstanding, is_credit, is_payed, id_user, id_subsidiary) VALUES (:id_customer, :datetime, :client_name, :amount, :disscount, :utility, :total, :expiration_date, :payed, :outstanding, :is_credit, :is_payed, :id_user, :id_subsidiary)";
    const queryParams = {
        id_customer: data.id_customer,
        datetime: data.datetime,
        client_name: data.client_name,
        amount: data.amount,
        disscount: data.disscount,
        utility: data.utility,
        total: data.total,
        expiration_date: data.expiration_date,
        payed: data.payed,
        outstanding: data.outstanding,
        is_credit: data.is_credit,
        is_payed: data.is_payed,
        id_user: data.id_user,
        id_subsidiary: data.id_subsidiary
    };
    
    const resQuery = await dbQuery(query, queryParams);
    
    if(!resQuery.success){
        return {success: false, message: `[saleModel::createSale]: ${ resQuery.message }`};
    }

    return resQuery;

}; // END createSale

const createSaleDetail = async (data) => {
    
    const query = "INSERT INTO product_sale_detail(id_sale, id_product, qty, price, disscount, total, utility) VALUES (:id_sale, :id_product, :qty, :price, :disscount, :total, :utility)";
    const queryParams = {
        id_sale: data.id_sale,
        id_product: data.id_product,
        qty: data.qty,
        price: data.price,
        disscount: data.disscount,
        total: data.total,
        utility: data.utility
    };
    
    const resQuery = await dbQuery(query, queryParams);
    
    if(!resQuery.success){
        return {success: false, message: `[saleModel::createSaleDetail]: ${ resQuery.message }`};
    }

    return resQuery;

}; // END createSale

const queryTest = async (data) => {
    
    const query = "SELECT * FROM user";
    const queryParams = {};
    
    const resQuery = await dbQuery(query, queryParams);
    
    if(!resQuery.success){
        return {success: false, message: `[saleModel::queryTest]: ${ resQuery.message }`};
    }

    return resQuery;

}; // END createSale
