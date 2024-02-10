const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/usercontent/'); // Specify your public directory here
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const handleUploadPhoto = (req, res, next) => {
    if(!req.body.photo){
        next();
        return;
    }
    const upload = multer({
        storage: storage,
        limits: { fileSize: 1000000 },
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    }).single('photo');

    upload(req, res, (err) => {
        if (err) {
            res.status(400).json({ message: err.message });
        } else {
            next();
        }
    });
}

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

module.exports = { handleUploadPhoto }