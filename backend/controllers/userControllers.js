const User = require("../models/user.model")
const DB = require("../models/db.model")
const Match = require("../models/match.model")
const dateFns = require("date-fns")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const compareNames = (name1, name2) => {
    const name1Set = new Set(name1.toLowerCase().split(" "));
    return name2.toLowerCase().split(" ").reduce((count, word) => {
        if (name1Set.has(word)) {
            return count + 1;
        }
        return count;
    }, 0);
}

const getOppositeGender = (g) => {
    if(g === "M") return "F"
    if(g === "F") return "M"
    return "O"
}

// match making algorithm
const user_match_get = async (req, res) => {
    if(!req.userID) {
        res.status(400).json({ message: "Bad Credentials" })
        return
    }

    const today = new Date();
    if(today < new Date("2024-02-09 00:00:00")) {
        res.status(400).json({ message: "Match making not started yet" })
        return
    }

    // if match already exists
    const match = await Match.findOne({ user: req.userID})
    if(match) {
        const matched = await User.findOne({ _id: match.match})
        res.status(200).json(matched)
        return
    }

    // if match does not exist, find a match
    try {
        const user = await User.findOne({ _id: req.userID})
        // if has no crush...
        if(!user.crush) {
            // select a random user
            res.status(200).json({ message: "ok" })
            return;
        }
        
        // if has a crush... if crush name matches with any user's name
        const matched = await User.findOne({gender : getOppositeGender(user.gender),  name: { $regex: new RegExp(user.crush, "i") }})
        if(!matched) {
            // select a random user
            res.status(200).json({ message: "ok" })
            return;
        }

        // if crush likes the user back
        if(compareNames(user.crush, matched.name) >= 1){
            const match = new Match({
                user: user._id,
                match: matched._id
            })
            match.save()
            .then((match) => {
                res.status(200).json( matched )
            })
            .catch((err) => {
                res.status(404).json({ message: "404 Not Found"})
            })
            return
        }

        // if crush does not like the user back
        // select a random user

        res.status(200).json({ message: "ok" })
    }
    catch(err) {
        res.status(404).json({ message: "404 Not Found"})
    }
}

const user_profile_get = (req, res) => {
    if(!req.userID) {
        res.status(400).json({ message: "Bad Credentials" })
        return
    }
    
    User.findOne({ _id: req.userID})
    .then((user) => {
        res.status(200).json(user)
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

    const { rollNo } = req.body

    DB.findOne({ rollNo })
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
            // if(!req.file) {
            //     res.status(400).json({ message: "Please upload a photo"})
            //     return
            // }
            // const filename = req.file.filename;
            // const imageUrl = `${req.protocol}://${req.get('host')}/usercontent/${filename}`;
            const hashedPassword = bcrypt.hashSync(req.body.password, 10)
            const myUser = new User({
                // photo: imageUrl,
                rollNo,
                name : req.body.name,
                gender : req.body.gender,
                email : req.body.email,
                password : hashedPassword,
                branch : req.body.branch,
                crush : req.body.crush,
                instagram_username : req.body.instagram_username,
                facebook_username : req.body.facebook_username,
                linkedin_username : req.body.linkedin_username,
                twitter_username : req.body.twitter_username
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