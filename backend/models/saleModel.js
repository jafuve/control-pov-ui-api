const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')
const Subsidiary = require('../models/subsidiaryModel');
const { getProduct, updateProductStock } = require('./productModel');

// Get 
const getProductSaleRecords = async (from, to, type = null) => {

    return new Promise(async (resolve, reject) => {

        // FILTERING
        let whereStmt = `WHERE datetime BETWEEN :from AND :to `;
        if(type == 1){ // CONTADO
            whereStmt += "AND is_credit = 0 ";
        }else if(type == 2){ // CREDITO
            whereStmt += "AND is_credit = 1 ";
        }

        try {
            const connection = await dbGetPoolConnection( await dbGetPool() );

            const query = `SELECT id_sale, id_customer, datetime, client_name, amount, disscount, utility, total, expiration_date, payed, outstanding, is_credit, is_payed, id_user, id_subsidiary FROM product_sale ${ whereStmt } ORDER BY datetime ASC`;
            console.log(query)
            const queryParms = {from, to};
    
            const resUsers = await dbQuery(query, queryParms, connection);
            resolve(resUsers);    

        } catch (error) {
            reject(`[saleModel::getProductSaleRecords]: ${ error }`)
        }
        
    }); // END OF PROMISE

};

const getSaleData = async (id_sale) => {

    return new Promise(async (resolve, reject) => {

    const connection = await dbGetPoolConnection( await dbGetPool() );

    const query = `SELECT id_sale, id_customer, datetime, client_name, amount, disscount, utility, total, expiration_date, payed, outstanding, is_credit, is_payed, id_user, id_subsidiary FROM product_sale WHERE id_sale = :id_sale`;
    const queryParms = {id_sale};
    // console.log("id_sale", id_sale)
    const resQuery = await dbQuery(query, queryParms, connection);

    if(resQuery.results.length <= 0){
        resolve({
            success: false,
            message: "No se ha podido obtener la venta con el identificador solicitado."
        })
    }

    resolve(resQuery);    

    });
} //END FUNCTION getSaleData

// Create customer
const handleCreateSale = async (data) => {
    
    try{
        
        const resTransaction = await createSaleTransaction(data);
        console.log("resTransaction", resTransaction)
        return resTransaction;
        
    } catch (error) {
        console.log(error)
        return { success: false, message: `[handleCreateSale]: ${ error.message }`}
    }
};

const createSaleTransaction = (data) => {
    
    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection( await dbGetPool() );
            
            connection.beginTransaction(async function(err) {
                
                if (err) { 
                    return reject({success: false, message: err})
                    // throw err; 
                }
            
                // CREATE SALE
                const resCreateSale = await createSale(data, connection);            
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
                // console.log(resSubsidiary)
                const id_warehouse = resSubsidiary.results[0].id_warehouse;
                
                // CREATE DETAIL
                const obj = data.detail;

                for(let i = 0; i < obj.length; i++){

                    // GET PRODUCT
                    const resProduct = await getProduct(obj[i].id_product);
                    if(!resProduct.success){
                        return connection.rollback(function() {
                            // throw err;
                            reject({success: false, message: resProduct.message})
                        });
                    } // END IF

                    const product = resProduct.results[0];
                    console.log(product.stock_control, "stock")
                    if(product.stock_control){

                        obj[i].id_sale = new_id_sale;

                        const resCreateDetail = await createSaleDetail(obj[i], connection);
                        if(!resCreateDetail.success){
                            return connection.rollback(function() {
                                // throw err;
                                reject({success: false, message: resCreateDetail.message})
                            });
                        }

                        //IF TRANSFER TO REGULARIZATION
                        if(true){
                        // if(data.regularization == "1"){
                            // 3. UPDATE STOCK
                            const dataUpdate = {
                                type: "2",
                                id_warehouse: id_warehouse,
                                id_product: obj[i].id_product,
                                qty: obj[i].qty
                            };
                            
                            const resUpdate = await updateProductStock(dataUpdate, connection);
                            // console.log("resupdate", resUpdate)
                            if(!resUpdate.success){
                                return connection.rollback(function() {
                                    // throw err;
                                    reject({success: false, message: resUpdate.message})
                                });
                            }

                        } // END IF

                    } // END IF

                } // END FOR

                // INSERT INTO PAYMENT IF CONTADO
                
                if(!data.is_credit){
                    data.payment.id_sale = new_id_sale;
                    const resPayment = await createPaymentSaleRecord(data.payment, connection);
                    
                    if(!resPayment.success){
                        return connection.rollback(function() {
                            // throw err;
                            reject({success: false, message: resPayment.message})
                        });
                    }
                } // END IF
                
                connection.commit(async function(error) {
                    if (error) {
                        return connection.rollback(function() {
                            // throw err;
                            reject({success: false, message: error})
                        });
                    }

                    connection.release();
                }); // end commit
                
                resolve({success: true, id_sale : resCreateSale.results.insertId,  message: `Venta creada con éxito.`})
                
            }); // END BEGIN TRANSACTION

        } catch (error) {
            console.log("otro")
            reject(error);
        }

    }); // END PROMISE

}; // END createSaleTransaction

const createSale = async (data, connection) => {
    
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
    
    const resQuery = await dbQuery(query, queryParams, connection);
    
    if(!resQuery.success){
        return {success: false, message: `[saleModel::createSale]: ${ resQuery.message }`};
    }

    return resQuery;

}; // END createSale

const createSaleDetail = async (data, connection) => {
    
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
    
    const resQuery = await dbQuery(query, queryParams, connection);
    
    if(!resQuery.success){
        return {success: false, message: `[saleModel::createSaleDetail]: ${ resQuery.message }`};
    }

    return resQuery;

}; // END createSale

// PAYMENT REGION

const handleCreatePaymentSale = async (data) => {
    
    try{
        
        const resTransaction = await createPaymentSaleTransaction(data);
        console.log("resTransaction", resTransaction)
        return resTransaction;
        
    } catch (error) {
        console.log(error)
        return { success: false, message: `[handleCreatePaymentSale]: ${ error.message }`}
    }

}; // END handleCreateBuy

const createPaymentSaleTransaction = (data) => {
    
    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection( await dbGetPool() );
            
            connection.beginTransaction(async function(err) {
                
                if (err) { 
                    return reject({success: false, message: err})
                    // throw err; 
                }

                // -. GET SALE DATA
                const resSale = await getSaleData(data.id_sale);
                if(!resSale.success){
                    return connection.rollback(function() {
                        // throw err;
                        reject({success: false, message: resSale.message})
                    });
                }
                
                const sale = resSale.results[0];

                if(sale.outstanding == 0){
                    return reject({success: false, message: "La venta no tiene ningun saldo pendiente"})
                }


                data.outstanding = sale.outstanding - data.amount;

                const newPayed = data.amount + sale.payed;
                // console.log(newPayed, "newPayed")
                // CREATE PAYMENT BUY
                const resCreatePaymentSale = await createPaymentSaleRecord(data, connection);            
                if(!resCreatePaymentSale.success){
                    return connection.rollback(function() {
                        reject({success: false, message: resCreatePaymentSale.message})
                    });
                }

                // 2. UPDATE SALE "PAYED" FIELD
                const resUpdateField1 = await updateSaleField(data.id_sale, 'payed', newPayed, connection);
                console.log(resUpdateField1)
                if(!resUpdateField1.success){
                    return connection.rollback(function() {
                        reject({success: false, message: resUpdateField1.message})
                    });
                }

                // 3. UPDATE BUY "BALANCE" FIELD
                const resUpdateField2 = await updateSaleField(data.id_sale, 'outstanding', data.outstanding, connection);
                if(!resUpdateField2.success){
                    return connection.rollback(function() {
                        reject({success: false, message: resUpdateField2.message})
                    });
                }

                // 3. UPDATE BUY "STATE" TO PAYED IF NEEDE
                if( data.outstanding == 0 ){
                    const resUpdateField3 = await updateSaleField(data.id_sale, 'is_payed', "1", connection);
                    if(!resUpdateField3.success){
                        return connection.rollback(function() {
                            reject({success: false, message: resUpdateField3.message})
                        });
                    }
                }
            
                connection.commit(async function(error) {
                    if (error) {
                        return connection.rollback(function() {
                            // throw err;
                            reject({success: false, message: error})
                        });
                    }

                    connection.release();
                }); // end commit
                
                resolve({success: true, id_sale : resCreatePaymentSale.results.insertId,  message: `Pago creado con éxito.`})
                
            }); // END BEGIN TRANSACTION

        } catch (error) {
            console.log("otro")
            reject(error);
        }

    }); // END PROMISE

}; // END createSaleTransaction

const createPaymentSaleRecord = async (data, pdo = null) => {

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
            resolve(resQuery);    

        } catch (error) {
            // console.log(error)
            reject({ success: false, message: `[saleModel::createPaymentSaleRecord]: ${ error }`})
        }
        
    }); // END OF PROMISE

};

const updateSaleField = async (id_sale, field, value, pdo = null) => {

    return new Promise(async (resolve, reject) => {

        const connection = (pdo == null) ? await dbGetPoolConnection( await dbGetPool() ) : pdo;

        const query = `UPDATE product_sale SET ${ field } = :value WHERE id_sale = :id_sale LIMIT 1`;
        const queryParms = {
            value,
            id_sale
        };

        const resQuery = await dbQuery(query, queryParms, connection);

        resolve(resQuery);   
    });

}; // END updateSaleField

module.exports = { getProductSaleRecords, getSaleData, handleCreateSale, handleCreatePaymentSale  }