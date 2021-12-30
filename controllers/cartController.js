const productModel = require('../models/productModel')
const validator = require('../validation/validator')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel');
const { findOneAndUpdate } = require('../models/productModel');

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId;
        const productId = req.body.items[0].productId

          if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({status: true, message: "Please Provide a Valid UserId in Params",});
            }
  
         if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({status: true, message: "Please Provide a Valid UserId in Params"});
        }
        if (req.body.items[0].quantity <1) {
          return res.status(400).send({status: true, message: "Please Add One Quantity at a Time"});
       }

        if(!(req.userId == userId)){
            return res.status(400).send({status: true, message:"You are not authorised to update Cart"})
        }

        let cartDetail = await cartModel.findOne({ userId: userId});

        if (!cartDetail) {
            return  res.status(400).send({status: true, message: "User Not exist",});
        }

        else if (!cartDetail) {
            let cartInfo = req.body;
            let totalPrice = 0;
            let items = cartInfo.items
            let totalItems = items.length;
            if (totalItems > 1) {
                return res.status(400).send({ status: true, message: "Please Add One Product at a Time" });
            }
            let productFound = await productModel.findOne({
                _id: (cartInfo.items[0].productId),
                isDeleted: false,
            });
            totalPrice = productFound.price * cartInfo.items[0].quantity

            cartInfo.userId = userId;
            cartInfo.totalItems = totalItems;
            cartInfo.totalPrice = totalPrice;

            const cartCreate = await cartModel.create(cartInfo);
            return res.status(201).send({ status: true,message: "Cart Successfully Created",data: cartCreate });
        } else {
            let cartInfo = req.body;
            let totalItems = cartInfo.items.length;
            if (totalItems > 1) {
                return res.status(400).send({ status: true, message: "Please Add One Product at a Time" })}
            let prod = {};
            prod.value = 0;
            let len = cartDetail.items.length;
            let prodId = cartInfo.items[0].productId;
            for (let i = 0; i < len; i++) {
                if (prodId == cartDetail.items[i].productId) {
                   
                    let prod2 = await productModel.findOne({ _id: prodId , isDeleted:false});
                    cartDetail.totalPrice =
                        Number(cartDetail.totalPrice) +
                        Number(prod2.price) * Number(cartInfo.items[0].quantity);
                        cartDetail.items[i].quantity = Number(cartDetail.items[i].quantity) + Number(cartInfo.items[0].quantity)
                       
                    prod.value = 1;
                    cartDetail.save();
                    break;
                     }
                 }   
                   if (prod.value === 0) {
                       cartDetail.items.push(cartInfo.items[0]);
                       cartDetail.totalItems++;
                        let prod2 = await productModel.findOne({ _id: cartInfo.items[0].productId });
                        cartDetail.totalPrice =
                            Number(cartDetail.totalPrice) +
                            Number(prod2.price) * Number(cartInfo.items[0].quantity);
                            cartDetail.save();
                    }
                     return res.status(200).send({status: true, msg: "Successful", data: cartDetail})
                
            
        }
    } catch (err) {

        return res.status(500).send({ status: false, message: err.message });
    }
};

const updateCart = async (req, res) => {
    try {
        let parUserId = req.params.userId;
        let { cartId, productId, removeProduct } = req.body;

        if (!validator.isValidObjectId(parUserId)) {
            return res.status(400).send({status: true, message: "Please Provide a Valid UserId in Params"});
        }

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({status: true, message: "Please Provide a Valid Cart Id"});
        }
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({status: true, message: "Please Provide a Valid productId"});
        }

        if(!(req.userId == parUserId)){
            return res.status(400).send({status: true, message:"You are not authorised to update Cart"})
        }
        let find = await cartModel.findOne({ _id: cartId});
        let len = find.items.length;
        if (!find) {
            return res
                .status(400)
                .send({ status: true, message: "This Cart id Does Not Exist" });
        }

        for (let i = 0; i < len; i++) {
            if (productId == find.items[i].productId) {
                if (removeProduct == 1) {
                    let prod = await productModel.findOne({ _id: productId, isDeleted:false });
                    find.totalPrice = Number(find.totalPrice) - Number(prod.price);
                    find.items[i].quantity -= 1;

                    if (find.items[i].quantity == 0) {
                        find.items.splice(i, 1);
                        find.totalItems -= 1;
                    }
                    find.save();
                    break;
                } else {
                    let prod2 = await productModel.findOne({ _id: productId, isDeleted:false });
                    find.totalPrice =
                        Number(find.totalPrice) -
                        Number(find.items[i].quantity) * Number(prod2.price);
                    find.items.splice(i, 1);
                    find.totalItems -= 1;
                    find.save();
                    if (find.items.length == 0) {
                        find.totalPrice = 0;
                    }
                    break;
                }
            }
        }
        return res
            .status(200)
            .send({ status: true, message: "Success", data: find });
    } catch (err) {
        return res.status(500).send({ status: true, message: err.message });
    }
};


const getCart = async function (req, res) {

    try {
        const cartId = req.body.cartId
        const userId = req.params.userId

        // if (req.userId != userId){
        //     return res.status(401).send({status:false, message: 'unauthorised access'})
        // }

        const userFound = await userModel.findOne({_id: userId, isDeleted:false})
        if(!userFound) {
            return res.status(400).send({status:false, message : 'userID does not exist'})
        }
        
        const cartFound = await cartModel.findOne({_id:cartId, isDeleted:false})
        if(!cartFound) {
            return res.status(400).send({status:false, message : 'cartID does not exist'})
        }

        return res.status(200).send({status: true, message: 'successfully fetched Cart Details', data: cartFound})
        
    }
 catch (err) {
    return res.status(500).send({ status: false, message: err.message });
}
}




const deleteCart = async function(req,res) {

    try{

        const userId = req.params.userId
        const cartId = req.body.cartId

    const cartFound = await cartModel.findOne({_id:cartId, isDeleted:false})
    if(!cartFound){
        return res.status(400).send({status: false, message: 'CartId not found'})
    }

    const userFound = await userModel.findOne({_id:userId, isDeleted:false})
    if(!userFound){
        return res.status(400).send({status: false, message: 'UserId not found'})
    }

    const items = cartFound.items
    const length = items.length
    let newArr = items.splice(length)

    
    cartFound.items = newArr
    cartFound.totalItems = newArr.length
    cartFound.totalPrice = 0

    const cartData = await cartModel.findOneAndUpdate({_id:cartId}, cartFound, {new:true})

    return res.status(200).send({status :true, message:'Cart deleted successfully', data:cartData})

    }
    catch(err) {
        return res.status(500).send({status:false, message:err.message})
    }
}































module.exports = {createCart, updateCart, getCart, deleteCart}
