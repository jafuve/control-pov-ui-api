const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const User = require('../models/authModel');

// Attempt login   =>   /api/v1/login
exports.attemptLogin = async(req, res, next) => {
    
    try {
        const resLogin = await User.attemptLogin(req.body.username, req.body.password);
        
        res.status(200).json(resLogin);
        
    } catch (error) {
        res.status(201).json({
            success: false,
            message: `[attemptLogin]: ${ error.message }`
        });
    }

}; //END FUNCTION

// Get all users   =>   /api/v1/users
exports.getUsers = async(req, res, next) => {

    const resUsers = await User.getUsers();

    if(!resUsers.success){
        return res.status(200).json({
            success: false,
            message: resUsers.message
        });
    }

    res.status(200).json({
        success: true,
        results: resUsers.results
    });

};

// Create product brand   =>   /api/v1/product/new
exports.createUser = catchAsyncErrors( async(req, res, next) => {
    // console.log(req.body)

    if(!req.body.username || !req.body.password){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    // TODO: valida unique username
    const resUsers = await User.getUsers();
    
    if(!resUsers.success){
        return res.status(200).json({
            success: false,
            message: resUsers.message,
        });
    } // END IF
    let isUsernameUnique = true;
    resUsers.results.forEach(element => {
        if(element.Username == req.body.username){
            isUsernameUnique = false;
        }
    });
    
    if(!isUsernameUnique){
        return res.status(200).json({
            success: false,
            message: `El usuario ${ req.body.username } no está disponible, por favor ingresa uno diferente.`,
        });
    } // END IF

    const resCreate = await  User.createUser(req.body);

    if(!resCreate.success){
        return res.status(200).json({
            success: false,
            message: resCreate.message
        });
    }

    res.status(200).json({
        success: true,
        message: `Usuario creado con éxito`,
        newId: resCreate.results.insertId,
        user: req.body
    });

}); // END getCustomers