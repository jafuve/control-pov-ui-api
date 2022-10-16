const { dbGetPool, dbGetPoolConnection, dbQuery } = require('./connection')

// Get clients 
exports.getProducts = async () => {

    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = `SELECT id_product, barcode, code, name, coste, FORMAT(price, 2) price, price_mayor, price_min, product_brand.product_brand brand, product_category.product_category category, product_meassure.product_meassure meassure, product.is_active, stock_min, url_image, volume, created_at, id_user 
            FROM product
            INNER JOIN product_brand ON product_brand.id_product_brand = product.id_product_brand
            INNER JOIN product_meassure ON product_meassure.id_product_meassure = product.id_product_meassure
            INNER JOIN product_category ON product_category.id_product_category = product.id_product_category
            `;
            const queryParms = {};

            const resUsers = await dbQuery(query, queryParms, connection);

            if (!resUsers.success) {
                return resolve({
                    success: resUsers.success,
                    origin: `productModel::getProducts`,
                    message: resUsers.message
                    // message: `[getProducts]: ${ JSON.stringify( resUsers.message ) }`
                });
            }

            // console.log(resUsers)
            resolve(resUsers);

        } catch (error) {
            reject(`[productModel::getProducts]: ${error}`)
        }

    }); // END OF PROMISE

};

// Get clients 
exports.getProduct = async (id_product) => {

    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "SELECT id_product, barcode, code, name, coste, price, price_mayor, price_min, id_product_brand, id_product_category, id_product_meassure, is_active, stock_min, stock_control,  url_image, volume, created_at, id_user FROM product WHERE id_product = :id_product";
            const queryParms = { id_product };

            const resQuery = await dbQuery(query, queryParms, connection);

            if (resQuery.results.length <= 0) {
                return resolve({ success: false, message: `No se ha podido obtener el producto solicitado.` })
            }

            if (!resQuery.success) {
                return resolve({
                    success: resQuery.success,
                    origin: `productModel::getProduct`,
                    message: resQuery.message
                    // message: `[getProducts]: ${ JSON.stringify( resQuery.message ) }`
                });
            }

            // console.log(resQuery)
            resolve(resQuery);

        } catch (error) {
            reject(`[productModel::getProducts]: ${error}`)
        }

    }); // END OF PROMISE

};

// Get clients 
exports.getProductStock = async (id_product, id_warehouse = null, pdo = null) => {

    return new Promise(async (resolve, reject) => {

        try {
            let query = "";
            let queryParms = { id_product };

            if (id_warehouse == null)
                query = "SELECT IFNULL( sum( (stock ) ), '-1') as Stock, id_product IdProduct FROM warehouse_stock WHERE id_product = :id_product LIMIT 1";
            else {
                query = "SELECT IFNULL( sum( (stock ) ), '-1') as Stock, id_product IdProduct FROM warehouse_stock WHERE id_product = :id_product AND id_warehouse = :id_warehouse LIMIT 1";
                queryParms = { id_product, id_warehouse }
            }

            const connection = (pdo == null) ? await dbGetPoolConnection(await dbGetPool()) : pdo;

            const resQuery = await dbQuery(query, queryParms, connection);

            if (!resQuery.success) {
                return resolve({
                    success: resQuery.success,
                    origin: `productModel::getProductStock`,
                    message: resQuery.message
                });
            }

            resolve({
                success: true,
                value: resQuery.results[0].Stock
            });

        } catch (error) {
            reject(`[productModel::getProducts]: ${error}`)
        }

    }); // END OF PROMISE

};

// Create customer
exports.createProduct = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {

            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "INSERT INTO product(barcode, code, name, coste, price, price_mayor, price_min, id_product_brand, id_product_category, id_product_meassure, is_active, stock_min, stock_control, url_image, volume, created_at, id_user) VALUES (:barcode, :code, :name, :coste, :price, :price_mayor, :price_min, :id_product_brand, :id_product_category, :id_product_meassure, :is_active, :stock_min, :stock_control, :url_image, :volume, :created_at, :id_user)";
            const queryParms = {
                barcode: data.barcode,
                code: data.code,
                name: data.name,
                coste: data.coste,
                price: data.price,
                price_mayor: data.price_mayor,
                price_min: data.price_min,
                id_product_brand: data.id_product_brand,
                id_product_category: data.id_product_category,
                id_product_meassure: data.id_product_meassure,
                is_active: data.is_active,
                stock_min: data.stock_min,
                stock_control: data.stock_control,
                url_image: data.url_image,
                volume: data.volume,
                created_at: new Date(),
                id_user: data.id_user,
            };

            const resCreate = await dbQuery(query, queryParms, connection);



            // console.log(resCreate)
            resolve(resCreate);

            // function queryResolve(resQuery){
            //     console.log("dbquery resolve")
            //     resolve(resQuery);    
            // }

            // function queryReject(err){
            //     console.log("dbquery reject")
            //     reject(err)
            // }

            // dbQuery(query, queryParms).then(
            //     queryResolve,
            //     queryReject
            // ).catch(err => {
            //     console.log("error aqui")
            //     reject(err)
            // });

        } catch (error) {
            reject(`[productModel::createProduct]: ${error}`)
        }

    }); // END OF PROMISE

};

exports.updateProductField = async (id_product, field, value, pdo = null) => {

    return new Promise(async (resolve, reject) => {

        const connection = (pdo == null) ? await dbGetPoolConnection(await dbGetPool()) : pdo;

        const query = `UPDATE product SET ${field} = :value WHERE id_product = :id_product LIMIT 1`;
        const queryParms = {
            value,
            id_product
        };

        const resQuery = await dbQuery(query, queryParms, connection);

        resolve(resQuery);
    });

}; // END updateProductField

exports.updateProductStock = async (data, pdo = null) => {
    return new Promise(async (resolve, reject) => {

        const connection = (pdo == null) ? await dbGetPoolConnection(await dbGetPool()) : pdo;

        if (data.type == "1") { //BUY

            const resProductStock = await this.getProductStock(data.id_product, data.id_warehouse, connection);
            // console.log(resProductStock)
            if (!resProductStock.success) {
                return resolve({ success: false, message: `[updateProductStock]: ${resProductStock.message}` })
            }
            // console.log("resProductStock",resProductStock.value)
            if (resProductStock.value < 0) {
                //INSERT
                const query = "INSERT INTO warehouse_stock(id_warehouse, id_product, stock) VALUES (:id_warehouse, :id_product, :qty)";
                const queryParms = {
                    id_warehouse: data.id_warehouse,
                    id_product: data.id_product,
                    qty: data.qty
                }

                const resQuery = await dbQuery(query, queryParms, connection);

                resolve(resQuery);

            }//END IF

        }// END IF

        const sign = (data.type == "1" ? "+" : "-");
        const query = `UPDATE warehouse_stock SET stock = (stock ${sign} :qty ) WHERE id_warehouse = :id_warehouse AND id_product = :id_product`;
        const queryParms = {
            id_warehouse: data.id_warehouse,
            id_product: data.id_product,
            qty: data.qty
        }

        const resQuery = await dbQuery(query, queryParms, connection);
        // console.log(resQuery)
        if (resQuery.success && resQuery.results.affectedRows <= 0) {
            // console.log("nada")
            return resolve({ success: false, message: 'No se ha realizado ninguna modificación.' })
        }

        resolve(resQuery);
    });


} //END FUNCTION

/*************************************************************************
 * PRODUCT BRAND SECTION - START
 *************************************************************************/
// Get Product Brands 
exports.getProductBrands = async () => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "SELECT id_product_brand, product_brand, is_active FROM product_brand";
            const queryParms = {};

            const resQuery = await dbQuery(query, queryParms, connection);

            if (!resQuery.success) {
                return reject(`[productModel::getProductBrands]: ${resQuery.message}`)
            }

            resolve(resQuery);

        } catch (error) {
            reject(`[productModel::getProductBrands]: ${error}`)
        }

    }); // END OF PROMISE

};
// Create customer
exports.createProductBrand = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "INSERT INTO product_brand(product_brand, is_active) VALUES (:product_brand, :is_active)";
            const queryParms = {
                product_brand: data.product_brand,
                is_active: data.is_active
            };

            const resCreate = await dbQuery(query, queryParms, connection);
            resolve(resCreate);

        } catch (error) {
            reject(`[productModel::createProductBrand]: ${error}`)
        }

    }); // END OF PROMISE

};
/*************************************************************************
 * PRODUCT BRAND SECTION - END
 *************************************************************************/

/*************************************************************************
 * PRODUCT CATEGORY SECTION - START
 *************************************************************************/
// Get Product Categories 
exports.getProductCategories = async () => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "SELECT id_product_category, product_category, is_active FROM product_category";
            const queryParms = {};

            const resQuery = await dbQuery(query, queryParms, connection);
            resolve(resQuery);

        } catch (error) {
            reject(`[productModel::getProductCategories]: ${error}`)
        }

    }); // END OF PROMISE

};
// Create customer
exports.createProductCategory = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "INSERT INTO product_category(product_category, is_active) VALUES (:product_category, :is_active)";
            const queryParms = {
                product_category: data.product_category,
                is_active: data.is_active
            };

            const resCreate = await dbQuery(query, queryParms, connection);
            resolve(resCreate);

        } catch (error) {
            reject(`[productModel::createProductCategory]: ${error}`)
        }

    }); // END OF PROMISE

};
/*************************************************************************
 * PRODUCT CATEGORY SECTION - END
 *************************************************************************/

/*************************************************************************
 * PRODUCT MEASSURE SECTION - START
 *************************************************************************/
// Get Product Meassures 
exports.getProductMeassures = async () => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "SELECT id_product_meassure, product_meassure, is_active, symbol FROM product_meassure";
            const queryParms = {};

            const resQuery = await dbQuery(query, queryParms, connection);
            resolve(resQuery);

        } catch (error) {
            reject(`[productModel::getProductMeassures]: ${error}`)
        }

    }); // END OF PROMISE

};
// Create customer
exports.createProductMeassure = async (data) => {

    return new Promise(async (resolve, reject) => {

        try {
            const connection = await dbGetPoolConnection(await dbGetPool());

            const query = "INSERT INTO product_meassure(product_meassure, is_active, symbol) VALUES (:product_meassure, :is_active, :symbol)";
            const queryParms = {
                product_meassure: data.product_meassure,
                is_active: data.is_active,
                symbol: data.symbol
            };

            const resCreate = await dbQuery(query, queryParms, connection);
            resolve(resCreate);

        } catch (error) {
            reject(`[productModel::createProductMeassure]: ${error}`)
        }

    }); // END OF PROMISE

};
/*************************************************************************
 * PRODUCT MEASSURE SECTION - END
 *************************************************************************/