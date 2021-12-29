const validator = require('../validation/validator')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const awsFunction = require('../controllers/awsControllers')


const createOrder = async (req, res) => {
    try{
    let paramsUserId = req.params.userId;
    if(!paramsUserId){
    return res.status(400).send({ status: false, message:"Please Provide UserId"})
    }
    // if(!(req.userId == paramsUser)){
    // return res.status(400).send({status: true, message:"You are not authorised to Create Order"})
    // }
    let prodInfo = req.body;
    let totalPrice = 0;
    let totalQuantity = 0;
    let totalItems = prodInfo.items.length;
    for(let i = 0; i < totalItems; i++){
    let dummy = await productModel.findOne({_id: (prodInfo.items[0].productId) })
    totalPrice = totalPrice + dummy.price * prodInfo.items[i].quantity
    totalQuantity = totalQuantity + Number(prodInfo.items[i].quantity)
    }
    prodInfo.userId = paramsUserId;
    prodInfo.totalItems = totalItems;
    prodInfo.totalPrice = totalPrice;
    prodInfo.totalQuantity = totalQuantity;
    const createProd = await orderModel.create(prodInfo);
    return res.status(201).send({status:true, message:"Successfully Order Created", data:createProd});
    }
    catch(err){
    return res.status(500).send({message: err.message});
    }
    }



// const updateOrder = async (req, res) => {
//     try{
//     let params = req.params.userId;
//     if(!params){
//     return res.status(400).send({ status: false, message:"Please Provide UserId"})
//     }
//     // if(!(req.userId == paramsUser)){
//     // return res.status(400).send({status: true, message:"You are not authorised to Create Order"})
//     // }
//     let orderId1 = req.body.orderId;
//     //Make sure that only cancellable order could be cancel. else send an appropriate error message and response
//     const orderUpdate = await orderModel.findOneAndUpdate({_id: orderId1, cancellable: true},{isDeleted: true})
//     return res.status(201).send({status: true, message: "Successfully Updated", data: orderUpdate})
//     }
//     catch(err){
//     return res.status(500).send({message: err.message});
//     }
//     }


module.exports = {createOrder}//,updateOrder}