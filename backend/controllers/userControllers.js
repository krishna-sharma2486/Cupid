const User = require("../models/user.model")
const DB = require("../models/db.model")
const dateFns = require("date-fns")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// match making algorithm
const user_match_get = (req, res) => {
    if(!req.userID) {
        res.status(400).json({ message: "Bad Credentials" })
        return
    }

    const today = new Date();
    if(today < new Date("2024-02-08 00:00:00")) {
        res.status(400).json({ message: "Match making not started yet" })
        return
    }

    if(today > new Date("2024-02-14 23:59:59")) {
        res.status(400).json({ message: "Match making ended" })
        return
    }

    res.status(200).json({ message: "Match making in progress" })
}

const user_profile_get = (req, res) => {
    if(!req.userID) {
        res.status(400).json({ message: "Bad Credentials" })
        return
    }
    
    User.findOne({ _id: req.userID})
    .then((user) => {
        res.status(200).json({ user })
    })
    .catch((err) => {
        res.status(404).json({ message: "404 Not Found"})
    })
}

const user_signup_post = (req, res) => {
    /* req.body structure 
    {
        "rollNo" : ...,
        "name" : ...,
        "gender" : ...,
        "email" : ...,
        "password" : ...,
        "branch" : ...,
        "crush" : ...,
        "socials" : {
            "instagram" : ...,
            "facebook" : ...,
            "linkedin" : ...,
            "twitter" : ...
        }
    }
    */
    const {rollNo, name, gender, email, password, branch, crush, socials} = req.body

    DB.findOne({rollNo})
    .then((validUser) => {
        if(!validUser){
            res.status(400).json({ message: "Not an NITJian"})
            return
        }
        User.findOne({ rollNo })
        .then((user) => {
            if(user) {
                res.status(400).json({ message: "User already exists"})
                return
            }
            if(!req.file) {
                res.status(400).json({ message: "Please upload a photo"})
                return
            }
            const filename = req.file.filename;
            const imageUrl = `${req.protocol}://${req.get('host')}/usercontent/${filename}`;
            const hashedPassword = bcrypt.hashSync(password, 10)
            const myUser = new User({
                photo: imageUrl,
                rollNo,
                name,
                gender,
                email,
                password : hashedPassword,
                branch,
                crush,
                socials : {
                    instagram : socials.instagram,
                    facebook : socials.facebook,
                    linkedin : socials.linkedin,
                    twitter : socials.twitter
                }
            })
            myUser.save()
            .then((user) => {
                const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
                res.status(201).json({
                    user,
                    token
                })
            })
            .catch((err) => {
                res.status(400).json({err : err.message})
            })
        })
    })
    .catch((err) => {
        res.status(404).json({ message: "404 Not Found"})
    })
}


const user_signin_post = (req, res) => {
    const {rollNo, password} = req.body

    User.findOne({rollNo})
    .then((user) => {
        if(!user) {
            res.status(400).json({ message: "User does not exist" })
            return
        }
        const isPasswordCorrect = bcrypt.compareSync(password, user.password)
        if(!isPasswordCorrect) {
            res.status(400).json({ message: "Bad Credentials" })
            return
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
        res.status(200).json({
            user,
            token
        })
    })
    .catch((err) => {
        res.status(404).json({ message: "404 Not Found"})
    })
}

module.exports = {
    user_signin_post,
    user_signup_post,
    user_profile_get,
    user_match_get
}