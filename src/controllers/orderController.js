const validator = require('../validation/validator')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const awsFunction = require('../controllers/awsControllers')
const orderModel = require('../models/orderModel')
const { findOne } = require('../models/productModel')



const createOrder = async (req, res) => {
    try {
        let paramsUserId = req.params.userId;
        if (!paramsUserId) {
            return res.status(400).send({ status: false, message: "Please Provide UserId" })
        }
        if(!(req.userId == paramsUserId)){
        return res.status(400).send({status: true, message:"You are not authorised to Create Order"})
        }
        let prodInfo = req.body;
        let totalPrice = 0;
        let totalQuantity = 0;
        let totalItems = prodInfo.items.length;
        
        for (let i = 0; i < totalItems; i++) {
            let dummy = await productModel.findOne({ _id: (prodInfo.items[0].productId) })
            totalPrice = totalPrice + dummy.price * prodInfo.items[i].quantity
            totalQuantity = totalQuantity + Number(prodInfo.items[i].quantity)
        }
        prodInfo.userId = paramsUserId;
        prodInfo.totalItems = totalItems;
        prodInfo.totalPrice = totalPrice;
        prodInfo.totalQuantity = totalQuantity;
        const createProd = await orderModel.create(prodInfo);
        return res.status(201).send({ status: true, message: "Successfully Order Created", data: createProd });
    }
    catch (err) {
        return res.status(500).send({ message: err.message });
    }
}



const cancelOrder = async (req, res) => {
    try {

        let orderId = req.body.orderId
        let paramsUserId = req.params.userId;

        if(!(req.userId == paramsUserId)){
            return res.status(400).send({status: true, message:"You are not authorised to Create Order"})
            }
            const orderDetails = await orderModel.findOne({_id:orderId})
            if(!orderDetails) {
                return res.status(400).send({status: true, message:"Order Not Found"})
            }
            if(orderDetails.cancellable === false) {
                return res.status(400).send({status: true, message:"This Order Can not be cancelled"})
            }
        const orderCancel = await orderModel.findOneAndUpdate({ _id: orderId }, { isDeleted: true, deletedAt: Date(), status: "cancelled" }, { new: true })
        return res.status(200).send({ status: true, message: 'Order has been cancelled Successfully', data: orderCancel });
    }
    catch (err) {
        res.status(500).send(err.message)
    }
}


module.exports = { createOrder ,cancelOrder}