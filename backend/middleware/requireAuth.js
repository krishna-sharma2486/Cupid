const jwt = require("jsonwebtoken")

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization
    if(!token){
        req.userID = null
        next()
        return
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if(err){
            req.userID = null
            next()
            return
        }
        req.userID = decodedToken.id
        next()
    })
}

module.exports = { requireAuth } 