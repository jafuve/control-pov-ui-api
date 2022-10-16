const Cashbox = require('../models/cashboxModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all customers   =>   /api/v1/customers
exports.getCashboxFlowRecords = catchAsyncErrors( async(req, res, next) => {

    if(!req.body.from || !req.body.to ){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    }
    
    const { results } = await Cashbox.getCashboxFlowRecords();

    res.status(200).json({
        success: true,
        results
    });

}); // END getCustomers

// Get all customers   =>   /api/v1/customer/new
exports.createCashboxFlowRecord = catchAsyncErrors( async(req, res, next) => {

    // DATA VALIDATION
    if(!req.body.opened_by){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    // VERIFY IF THERE IS ANY CASHBOX FLOW CURRENTLY OPEN
    const resLastRecord = await Cashbox.getLastCashboxFlowRecord(req.body.id_subsidiary);
    const { results:lastRecords } = resLastRecord;

    if(lastRecords.length > 0 && !lastRecords[0].is_closed){

        return res.status(200).json({
            success: false,
            message: "No es posible aperturar caja, debido a que aún no se ha cerrado la caja anterior."
        });    

    } // END IF

    // CREATE CASHBOX FLOW RECORD
    const resCreate = await Cashbox.createCashboxFlowRecord(req.body);

    if(!resCreate.success){
        return res.status(200).json({
            success: false,
            message: resCreate.message
        });
    }

    res.status(200).json({
        success: true,
        message: `Arqueo de caja creado con éxito`,
        newId: resCreate.results.insertId,
        customer: req.body
    });

}); // END getCustomers

// Get all customers   =>   /api/v1/customer/new
exports.updateCashboxFlowRecord = catchAsyncErrors( async(req, res, next) => {

    // DATA VALIDATION
    if(!req.body.id_subsidiary || !req.params.id){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    // VERIFY IF THERE IS ANY CASHBOX FLOW CURRENTLY OPEN
    const resLastRecord = await Cashbox.getLastCashboxFlowRecord(req.body.id_subsidiary);
    const { results:lastRecords } = resLastRecord;
    
    if(lastRecords.length === 0){

        return res.status(200).json({
            success: false,
            message: "No ha sido posible obtener el arqueo correspondiente."
        });    

    } // END IF

    if(lastRecords[0].id_record == req.params.id && lastRecords[0].is_closed){

        return res.status(200).json({
            success: false,
            message: "Lo sentimos, la caja indicada ya ha sido cerrada."
        });    

    } // END IF
    
    if(lastRecords[0].is_closed){

        return res.status(200).json({
            success: false,
            message: "No es posible cerrar caja, debido a que aún no se ha aperturado una nueva."
        });    

    } // END IF

    // CREATE CASHBOX FLOW RECORD
    req.body.id_record = req.params.id;
    // console.log(req.body.id_record)
    const resCreate = await Cashbox.updateCashboxFlowRecord(req.body);

    const { results } = resCreate;

    if(results.affectedRows <= 0){
        return res.status(200).json({
            success: false,
            message: "Ningun elemento ha sido actualizado."
        }); 
    }

    res.status(200).json({
        success: true,
        message: `Arqueo de caja cerrado con éxito`,
        customer: req.body
    });

}); // END getCustomers