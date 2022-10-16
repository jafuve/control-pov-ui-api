const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')
const Subsidiary = require('../models/subsidiaryModel');
const { getProduct, updateProductField, updateProductStock } = require('./productModel');

// Get 
const getProductBuyRecords = async (from, to, type = null) => {

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

            const query = `SELECT id_buy, id_supplier, datetime, amount, disscount, total, expiration_date, payed, outstanding, is_credit, is_payed, id_user FROM product_buy ${ whereStmt } ORDER BY datetime ASC`;
            const queryParms = {from, to};
    
            const resUsers = await dbQuery(query, queryParms, connection);
            resolve(resUsers);    

        } catch (error) {
            reject(`[buyModel::getProductBuyRecords]: ${ error }`)
        }
        
    }); // END OF PROMISE

};

const getBuyData = async (id_buy) => {

    return new Promise(async (resolve, reject) => {

    const connection = await dbGetPoolConnection( await dbGetPool() );

    const query = `SELECT id_buy, id_supplier, datetime, amount, disscount, total, expiration_date, payed, outstanding, is_credit, is_payed, id_user FROM product_buy WHERE id_buy = :id_buy`;
    const queryParms = {id_buy};
    
    const resQuery = await dbQuery(query, queryParms, connection);

    if(resQuery.results.length <= 0){
        resolve({
            success: false,
            message: "No se ha podido obtener la compra con el identificador solicitado."
        })
    }

    resolve(resQuery);    

    });
} //END FUNCTION

// Handle Create Buy
const handleCreateBuy = async (data) => {
    
    try{
        
        const resTransaction = await createBuyTransaction(data);
        console.log("resTransaction", resTransaction)
        return resTransaction;
        
    } catch (error) {
        console.log(error)
        return { success: false, message: `[handleCreateBuy]: ${ error.message }`}
    }

}; // END handleCreateBuy

const createBuyTransaction = (data) => {
    
    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection( await dbGetPool() );
            
            connection.beginTransaction(async function(err) {
                
                if (err) { 
                    return reject({success: false, message: err})
                    // throw err; 
                }
            
                // CREATE BUY
                const resCreateBuy = await createBuy(data, connection);            
                if(!resCreateBuy.success){
                    return connection.rollback(function() {
                        // throw err;
                        reject({success: false, message: resCreateBuy.message})
                    });
                }
                
                const new_id_buy = resCreateBuy.results.insertId;
            
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
                
                // CREATE BUY DETAIL
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

                    if(product.stock_control){

                        obj[i].id_buy = new_id_buy;

                    const resCreateDetail = await createBuyDetail(obj[i], connection);
                    if(!resCreateDetail.success){
                        return connection.rollback(function() {
                            // throw err;
                            reject({success: false, message: resCreateDetail.message})
                        });
                    }

                    //IF TRANSFER TO REGULARIZATION
                    if(data.regularization == "1"){

                        //UPDATE COSTE
                        let newCoste = -1;

                        // SET COSTE LAST TO PRODUCT
                        if(obj[i].price != product.coste)
                            newCoste = obj[i].price; 
                        // TODO: SET CPP COSTE

                        if(newCoste != -1){
                            
                            const resUpdateCoste = await updateProductField( obj[i].id_product, 'coste', newCoste, connection );
                            
                            if(!resUpdateCoste.success){
                                // console.log("inn heere", resUpdateCoste)
                                return connection.rollback(function() {
                                    // throw err;
                                    reject({success: false, message: resUpdateCoste.message})
                                });
                            }
                
                        }//END IF

                         // 3. UPDATE STOCK
                        const dataUpdate = {
                            type: "1",
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
                    data.payment.id_buy = new_id_buy;
                    const resPayment = await this.createPaymentBuyRecord(data.payment, connection);
                    
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
                
                resolve({success: true, id_sale : resCreateBuy.results.insertId,  message: `Compra creada con éxito.`})
                
            }); // END BEGIN TRANSACTION

        } catch (error) {
            console.log("otro")
            reject(error);
        }

    }); // END PROMISE

}; // END createSaleTransaction

const createBuy = async (data, connection) => {
    
    const query = "INSERT INTO product_buy(id_supplier, datetime, amount, disscount, total, expiration_date, payed, outstanding, is_credit, is_payed, id_user) VALUES (:id_supplier, :datetime, :amount, :disscount, :total, :expiration_date, :payed, :outstanding, :is_credit, :is_payed, :id_user)";
    
    const queryParams = {
        id_supplier: data.id_supplier,
        datetime: data.datetime,
        amount: data.amount,
        disscount: data.disscount,
        total: data.total,
        expiration_date: data.expiration_date,
        payed: data.payed,
        outstanding: data.outstanding,
        is_credit: data.is_credit,
        is_payed: data.is_payed,
        id_user: data.id_user
    };
    
    const resQuery = await dbQuery(query, queryParams, connection);
    
    if(!resQuery.success){
        return {success: false, message: `[saleModel::createBuy]: ${ resQuery.message }`};
    }

    return resQuery;

}; // END createBuy

const createBuyDetail = async (data, connection) => {
    
    const query = "INSERT INTO product_buy_detail(id_buy, id_product, qty, price, disscount, total) VALUES (:id_buy, :id_product, :qty, :price, :disscount, :total)";
    const queryParams = {
        id_buy: data.id_buy,
        id_product: data.id_product,
        qty: data.qty,
        price: data.price,
        disscount: data.disscount,
        total: data.total
    };
    
    const resQuery = await dbQuery(query, queryParams, connection);
    
    if(!resQuery.success){
        return {success: false, message: `[saleModel::createBuyDetail]: ${ resQuery.message }`};
    }

    return resQuery;

}; // END createBuyDetail

const createPaymentBuyRecord = async (data, pdo = null) => {

    return new Promise(async (resolve, reject) => {
        
        try {
            const connection = (pdo == null) ? await dbGetPoolConnection( await dbGetPool() ) : pdo;
            
            const query = "INSERT INTO payment_buy(id_buy, datetime, cash_amount, card_amount, card_number, credit_note, credit_note_ref, check_amount, check_detail, id_user) VALUES (:id_buy, :datetime, :cash_amount, :card_amount, :card_number, :credit_note, :credit_note_ref, :check_amount, :check_detail, :id_user)";
            const queryParms = {
                id_buy: data.id_buy,
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
            resolve(resQuery);    

        } catch (error) {
            console.log(error)
            // return { success: false, message: `[customerModel::createPaymentSaleRecord]: ${ error }` }
            reject({ success: false, message: `[paymentBuyModel::createPaymentBuyRecord]: ${ error }`})
        }
        
    }); // END OF PROMISE

};

const handleCreatePaymentBuy = async (data) => {
    
    try{
        
        const resTransaction = await createPaymentBuyTransaction(data);
        console.log("resTransaction", resTransaction)
        return resTransaction;
        
    } catch (error) {
        console.log(error)
        return { success: false, message: `[handleCreatePaymentBuy]: ${ error.message }`}
    }

}; // END handleCreateBuy

const createPaymentBuyTransaction = (data) => {
    
    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection( await dbGetPool() );
            
            connection.beginTransaction(async function(err) {
                
                if (err) { 
                    return reject({success: false, message: err})
                    // throw err; 
                }

                // -. GET SALE DATA
                const resBuy = await getBuyData(data.id_buy);
                if(!resBuy.success){
                    return connection.rollback(function() {
                        // throw err;
                        reject({success: false, message: resBuy.message})
                    });
                }
                
                const buy = resBuy.results[0];

                if(buy.outstanding == 0){
                    return reject({success: false, message: "La compra no tiene ningun saldo pendiente"})
                }


                data.outstanding = buy.outstanding - data.amount;

                const newPayed = data.amount + buy.payed;
                console.log(newPayed, "newPayed")
                // CREATE PAYMENT BUY
                const resCreatePaymentBuy = await createPaymentBuyRecord(data, connection);            
                if(!resCreatePaymentBuy.success){
                    return connection.rollback(function() {
                        reject({success: false, message: resCreatePaymentBuy.message})
                    });
                }

                // 2. UPDATE SALE "PAYED" FIELD
                const resUpdateField1 = await updateBuyField(data.id_buy, 'payed', newPayed, connection);
                console.log(resUpdateField1)
                if(!resUpdateField1.success){
                    return connection.rollback(function() {
                        reject({success: false, message: resUpdateField1.message})
                    });
                }

                // 3. UPDATE BUY "BALANCE" FIELD
                const resUpdateField2 = await updateBuyField(data.id_buy, 'outstanding', data.outstanding, connection);
                if(!resUpdateField2.success){
                    return connection.rollback(function() {
                        reject({success: false, message: resUpdateField2.message})
                    });
                }

                // 3. UPDATE BUY "STATE" TO PAYED IF NEEDE
                if( data.outstanding == 0 ){
                    const resUpdateField3 = await updateBuyField(data.id_buy, 'is_payed', "1", connection);
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
                
                resolve({success: true, id_sale : resCreatePaymentBuy.results.insertId,  message: `Pago creado con éxito.`})
                
            }); // END BEGIN TRANSACTION

        } catch (error) {
            console.log("otro")
            reject(error);
        }

    }); // END PROMISE

}; // END createSaleTransaction

const updateBuyField = async (id_buy, field, value, pdo = null) => {

    return new Promise(async (resolve, reject) => {

        const connection = (pdo == null) ? await dbGetPoolConnection( await dbGetPool() ) : pdo;

        const query = `UPDATE product_buy SET ${ field } = :value WHERE id_buy = :id_buy LIMIT 1`;
        const queryParms = {
            value,
            id_buy
        };

        const resQuery = await dbQuery(query, queryParms, connection);

        resolve(resQuery);   
    });

}; // END updateBuyField

module.exports = { getProductBuyRecords, getBuyData, handleCreateBuy, handleCreatePaymentBuy  }