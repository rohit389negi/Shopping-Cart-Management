const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');




const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const aws = require('../controllers/awsControllers')
const validator = require('../validation/validator')


const registerUser = async (req, res) => {

    try {
       // let data = req.body
        let files = req.files;
        const { fname, lname, email, profileImage, phone, password, address } = files

        // if (!(validator.isValidRequestBody(data))) {
        //     return res.status(400).send({ status: false, message: "Invalid request parameters.. Please Provide User Details" })
        // }

        // if (!validator.isValid(fname)) {
        //     return res.status(400).send({ status: false, message: "Please Provide First Name" })
        // }

        // if (!validator.isValid(lname)) {
        //     return res.status(400).send({ status: false, message: "Please Provide last Name" })
        // }

        // if (!validator.isValid(email)) {
        //     return res.status(400).send({ status: false, message: "Please Provide Email" })
        // }

        // if (!validator.isValid(profileImage)) {
        //     return res.status(400).send({ status: false, message: "Please Select Profile Image" })
        // }

        // if (!validator.isValid(phone)) {
        //     return res.status(400).send({ status: false, message: "Please Provide Phone" })
        // }

        // if (!validator.isValid(password)) {
        //     return res.status(400).send({ status: false, message: "Please Provide Password " })
        // }

        // if (!validator.isValid(address)) {
        //     return res.status(400).send({ status: false, message: "Please Provide Address" })
        // }

        // if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(trimEmail.trim()))) {
        //     return res.status(400).send({ status: false, message: `Enter a valid email address` })
        // }

        // if (!/^[0-9]\d{9}$/gi.test(phone.trim())) {
        //     return res.status(400).send({
        //         status: false,
        //         message: "Phone should be a valid number",
        //     });
        // }

        // if(!validator.isValidPassword(password)){
        //     return res.status(400).send({
        //         status: false,
        //         message: "Phone should be a valid number",
        //     });
        // }

    //    // generate salt to hash password
    //     const salt = await bcrypt.genSalt(10);
    //     // now we set user password to hashed password
    //     data.password = await bcrypt.hash(data.password, salt);
    //     data.save().then((doc) => res.status(201).send(doc));




        if (files && files.length > 0) {

            let uploadedFileURL = await aws.uploadFile([0]);
            data.profileImage = uploadedFileURL;

            
            // generate salt to hash password
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
             data.password = await bcrypt.hash(data.password, salt);
             const userData = { fname, lname, email, profileImage, phone, password, address }
            const savedData = await userModel.create(userData);
            return res.status(201).send({ status: true, message: "Successfully Created", data: savedData });

        } else {
            return res.status(404).send({ status: false, message: "Select an Image File" })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, "message": err.message })
    }

}

const Login = async (req, res) => {
    try{
        const mEmail = req.body.email;
        const mPassword = req.body.password;

        let user = await userModel.findOne({email: mEmail})
        if(user) {
            const {_id, name, password} = user

            const validPassword = await bcrypt.compare(mPassword, password)

            if(!validPassword){
                return res.status(400).send({status: false, message:" Invalid password"})
            }
            let payload = { userId: _id}
            const generatedToken = jwt.sign(payload, "Exodus", {expiresIn: '90m'})

            res.header('user-login', generatedToken)

            return res.status(200).send({status: true,message: name + ", You have  logged in successfully", userId: user._id, token: generatedToken})
        }else{
            return res.status(400).send({status:false,message: "Oops...Invalid Credentials"})
        }
    }
    catch(err){
        return res.status(500).send({ status: false, "message": err.message})
    }
}



module.exports = { registerUser,Login }
