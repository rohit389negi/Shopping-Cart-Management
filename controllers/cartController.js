const productModel = require('../models/productModel')
const validator = require('../validation/validator')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')

const AddToCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let requestBody = req.body

        const items = requestBody.items
        const productId = items[0].productId
        const quantity = items[0].quantity

        
        // const {productId, quantity} = requestBody

        const userdetails = await userModel.findOne({ _id: userId })
        if (!userdetails) {
         return   res.status(400).send({ status: false, message: 'no user exist' })
            }

        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
    //  console.log(productDetails)
        if (!productDetails) {
          return  res.status(400).send({ status: false, message: 'product not exist or product may be deleted' })
            }

        const cartInfo = await cartModel.findOne({userId:userId}).select({_id: 1})
            console.log(cartInfo)
        if (!cartInfo) {
            const price = productDetails.price
            const totalPrice = price * quantity

            const  savedData = { userId:userId, items:items, totalPrice:totalPrice, totalItems:items.length } 

            const addProduct = await cartModel.create(savedData) 
            return res.status(201).send({ status: true, message: 'product added successfully', data: addProduct })
        }

            const items1 = cartInfo.items 
            items1.push(requestBody.items[0]) 
            const price = productDetails.price
            const totalPrice = price * quantity
            console.log(items1)
            
            const  savedData = { userId:userId, items:items1, totalPrice:totalPrice, totalItems:items.length } 
            const addData = await cartModel.findOneAndUpdate({userId:userId}, savedData, {new:true})
         //   const createCart = await cartModel.create(savedData)
            return res.status(201).send({ status: true, message: 'cart added successfully', data: addData })
        
    }

catch (error) {
  return  res.status(500).send({ seatus: false, message: error.message })
}
}


//  if (!validator.isvalidObjectId(userId)) {
//     res.status(400).send({ status: false, message: 'user id invalid' })
    
// }
// if (!validator.isvalidObjectId(productId)) {
//     res.staus(400).send({ status: false, message: 'product id is not valid' })
// }
// if (req.userId != userId) {
//     res.status(401).send({ status: false, message: 'unauthorization access' })
// }

const updateCart = async function(req, res) {
    try{
        const userId = req.params.userId
        const requestBody = req.body
        const cartId = requestBody.cartId
        const productId = requestBody.productId
        const removeProduct = requestBody.removeProduct

        const cartFound = await cartModel.findOne({_id:cartId})
        if(!cartFound){
          return res.status(400).send({status:false,message:'cart Id not found'})
        }

        const userFound = await userModel.findOne({_id:userId})
        if(!userFound){
            return res.status(400).send({status:false,message:'user Id not found'})
          }
  
        const productFound = await productModel.findOne({_id:productId})
        if(!productFound){
            return res.status(400).send({status:false,message:'product Id not found'})
          }
        const cartItems = cartFound.items
        
        for (let i=0; i<cartItems.length; i++) {
            if(cartItems[i].quantity <= removeProduct) {  
            let quantity = cartItems[i].quantity    
            quantity = quantity - removeProduct 
            }
        }
        // for(let i=0;i<find.items.length;i++){
        //     if(cartInfo.items[0].productId == find.items[i].productId){
        //     let prod = await productModel.findOne({_id: cartInfo.items[i].productId})
        //     find.totalPrice = Number(find.totalPrice) + Number(prod.price) * Number(cartInfo.items[i].quantity)
        //     find.save();
        //     }
        //     }

        if (cartId) {
            const data = await cartModel.findOneAndUpdate({_id: productId})
            return res.status(200).send({status:true, message: "Successfully updated data"})
        }
    }
    catch {
    }
} 








module.exports = {AddToCart, updateCart}
