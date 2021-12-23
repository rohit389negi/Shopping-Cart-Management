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
        let data = req.body
        let files = req.files;
        const { fname, lname, email, phone, password, address } = data

        // if (!(validator.isValidRequestBody(data))) {
        //     return res.status(400).send({ status: false, message: "Invalid request parameters.. Please Provide User Details" })
        // }

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please Provide First Name" })
        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please Provide last Name" })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please Provide Email" })
        }


        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please Provide Phone" })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please Provide Password " })
        }

        if (!validator.isValid(address)) {
            return res.status(400).send({ status: false, message: "Please Provide Address" })
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
            return res.status(400).send({ status: false, message: `Enter a valid email address` })
        }

        if (!/^[0-9]\d{9}$/gi.test(phone.trim())) {
            return res.status(400).send({
                status: false,
                message: "Phone should be a valid number",
            });
        }

        if(!validator.isValidPassword(password)){
            return res.status(400).send({
                status: false,
                message: "Password should be a valid number",
            });
        }

        if (files && files.length > 0) {

            let uploadedFileURL = await aws.uploadFile(files[0]);
            data.profileImage = uploadedFileURL;

            // generate salt to hash password
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
             data.password = await bcrypt.hash(data.password, salt);


          //   const userData = { fname, lname, email, profileImage, phone, password, address }
            const savedData = await userModel.create(data);
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

            const _id= user._id
            const name= user.fname
            const password= user.password

            const validPassword = await bcrypt.compare(mPassword, password)

            if(!validPassword){
                return res.status(400).send({status: false, message:" Invalid password"})
            }
            let payload = { userId: _id}
            const generatedToken = jwt.sign(payload, "Exodus", {expiresIn: '90m'})

            res.header('user-login', generatedToken)

            return res.status(200).send({status: true, message: name + ", You have  logged in successfully", userId: user._id, token: generatedToken})
        }else{
            return res.status(400).send({status:false,message: "Oops...Invalid Credentials"})
        }
    }
    catch(err){
        return res.status(500).send({ status: false, "message": err.message})
    }
}



const getUserData = async function (req, res) {
    
    try {
        const userId = req.params.userId
        

        // if (!validator.isValidObjectId(userId)) {
        //     res.status(400).send({ status: false, msg: `Invalid request. No request passed in the query` })
        //     return
        // }

        if(req.userId != userId) {
            res.status(400).send({ status: false, msg: `Unauthorised Access` })
            return
        }


        let userDetail = await userModel.findOne({ _id: userId })
        

        if(!userDetail){
            res.status(400).send({status:false, message: `No user exist with this ${userId}`})
        }

        res.status(200).send({ status: true, message: `unSuccesslly fetched user details`, data: userDetail })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}


const updateUserData = async function (req, res) {
    
    try{
        const updateData = req.body
        const files = req.files
        const userId = req.params.userId
        const { fname, lname, email, profileImage, phone, password, address } = updateUserData

        if(!validator.isValidObjectId(userId)){
            res.status(400).send({ status: false, message: `Invalid UserId` })
            
        }
        // if (files && files.length > 0) {

        // if(req.userId != userId) {
        //     res.status(400).send({ status: false, msg: `Unauthorised Access` })
        //     return
        // }

        let uploadedFileURL = await aws.uploadFile(files[0]);
            updateData.profileImage = uploadedFileURL;

        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, msg: `Invalid request. No request passed in the query` })
            return
        }

        if (fname) {
            obj.fname = fname
        }
        if (lname) {
            obj.lname = lname
        }
        if (email) {
            obj.email = email
        }
        if (phone) {
            obj.phone = phone
        }
        if (password) {
            obj.password = password
        }


        const updatedData = await userModel.findOneAndUpdate({_id:userId}, {fname:fname, lname:lname, email:email, profileImage:profileImage, phone:phone, password:password },{new:true})
        //   console.log(updatedData)
        res.status(200).send({ status: true, message: `Successlly updated user details`, data: updatedData })
    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}




module.exports = { registerUser,Login, getUserData, updateUserData}
