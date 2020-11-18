const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req,res,next){
    const token = req.header('x-auth-token')

    if(!token)
    {
        return res.status(401).json({msg:'No token, authorizatrion denied'})
    }

    try{
        const decoded = jwt.verify(token,config.get('jwtSecret'))

        req.user = decoded.user
        next()
    }catch (e){
        res.status(401).json({msg:'token is not valid'})
    }
}