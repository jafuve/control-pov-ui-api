module.exports = func => (req, res, next) =>
    Promise.resolve(func(req, res, next))
            .catch( error =>{
                // console.log("CAE: ", err)
                // if(err.trim().length === 0)
                //     err = 'Ha ocurrido un error no identificado';
                // next
                res.status(200).json({
                    success: false,
                    message: `CAE ${ error }`
                });

                // next
        })