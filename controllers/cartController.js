const productModel = require('../models/productModel')
const validator = require('../validation/validator')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')

// const AddToCart = async function (req, res) {
//     try {
//         let userId = req.params.userId
//         let requestBody = req.body

//         const items = requestBody.items
//         const productId = items[0].productId
//         const quantity = items[0].quantity

        
//         // const {productId, quantity} = requestBody

//         const userdetails = await userModel.findOne({ _id: userId })
//         if (!userdetails) {
//          return   res.status(400).send({ status: false, message: 'no user exist' })
//             }

//         const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
//     //  console.log(productDetails)
//         if (!productDetails) {
//           return  res.status(400).send({ status: false, message: 'product not exist or product may be deleted' })
//             }

//         const cartInfo = await cartModel.findOne({userId:userId})
//             console.log(cartInfo)
//         if (!cartInfo) {
//             const price = productDetails.price
//             const totalPrice = price * quantity

//             const  savedData = { userId:userId, items:items, totalPrice:totalPrice, totalItems:items.length } 

//             const addProduct = await cartModel.create(savedData) 
//             return res.status(201).send({ status: true, message: 'product added successfully', data: addProduct })
//         }

//             const items1 = cartInfo.items 
//             items1.push(requestBody.items[0]) 
//             const price = productDetails.price
//             const totalPrice = price * quantity
//             console.log(items1)
            
//             const  savedData = { userId:userId, items:items1, totalPrice:totalPrice, totalItems:items.length } 
//             const addData = await cartModel.findOneAndUpdate({userId:userId}, savedData, {new:true})
//          //   const createCart = await cartModel.create(savedData)
//             return res.status(201).send({ status: true, message: 'cart added successfully', data: addData })
        
//     }

// catch (error) {
//   return  res.status(500).send({ seatus: false, message: error.message })
// }
// }


//  if (!validator.isvalidObjectId(userId)) {
//     res.status(400).send({ status: false, message: 'user id invalid' })
    
// }
// if (!validator.isvalidObjectId(productId)) {
//     res.staus(400).send({ status: false, message: 'product id is not valid' })
// }
// if (req.userId != userId) {
//     res.status(401).send({ status: false, message: 'unauthorization access' })
// }

// const updateCart = async function(req, res) {
//     try{
//         const userId = req.params.userId
//         const requestBody = req.body
//         const cartId = requestBody.cartId
//         const productId = requestBody.productId
//         const removeProduct = requestBody.removeProduct

//         const cartFound = await cartModel.findOne({_id:cartId})
//         if(!cartFound){
//           return res.status(400).send({status:false,message:'cart Id not found'})
//         }

//         const userFound = await userModel.findOne({_id:userId})
//         if(!userFound){
//             return res.status(400).send({status:false,message:'user Id not found'})
//           }
  
//         const productFound = await productModel.findOne({_id:productId})
//         if(!productFound){
//             return res.status(400).send({status:false,message:'product Id not found'})
//           }
//         const cartItems = cartFound.items
        
//         for (let i=0; i<cartItems.length; i++) {
//             if(cartItems[i].quantity <= removeProduct) {  
//             let quantity = cartItems[i].quantity    
//             quantity = quantity - removeProduct 
//             }
//         }
        // for(let i=0;i<find.items.length;i++){
        //     if(cartInfo.items[0].productId == find.items[i].productId){
        //     let prod = await productModel.findOne({_id: cartInfo.items[i].productId})
        //     find.totalPrice = Number(find.totalPrice) + Number(prod.price) * Number(cartInfo.items[i].quantity)
        //     find.save();
        //     }
        //     }

//         if (cartId) {
//             const data = await cartModel.findOneAndUpdate({_id: productId})
//             return res.status(200).send({status:true, message: "Successfully updated data"})
//         }
//     }
//     catch {
//     }
// } 


const createCart = async function (req, res) {
    try {
        let paramsUser = req.params.userId;

        if (!paramsUser) {
            return res
                .status(400)
                .send({
                    status: true,
                    message: "Please Provide a Valid UserId in Params",
                });

            if(cartInfo.items[0].quantity == 0){
                return res.status(400).send({status: true, message: "Please add Atleast One Quantity to the cart"})
            }
        }
        // if(!(req.userId == paramsUser)){
        //     return res.status(400).send({status: true, message:"You are not authorised to update Cart"})
        // }

        let find = await cartModel.findOne({ userId: paramsUser });
        if (!find) {
            let cartInfo = req.body;
            let totalPrice = 0;
            let totalItems = cartInfo.items.length;
            if (totalItems > 1) {
                return res
                    .status(400)
                    .send({ status: true, message: "Please Add One Product at a Time" });
            }
            let dummy = await productModel.findOne({
                _id: (cartInfo.items[0].productId),
                isDeleted: false,
            });
            totalPrice = dummy.price * cartInfo.items[0].quantity;

            cartInfo.userId = paramsUser;
            cartInfo.totalItems = totalItems;
            cartInfo.totalPrice = totalPrice;

            const cartCreate = await cartModel.create(cartInfo);
            return res
                .status(201)
                .send({
                    status: true,
                    message: "Cart Successfully Created",
                    data: cartCreate,
                });
        } else {
            let cartInfo = req.body;
            let totalItems = cartInfo.items.length;
            if (totalItems > 1) {
                return res
                    .status(400)
                    .send({ status: true, message: "Please Add One Product at a Time" });
            }
            let prod = {};
            prod.value = 0;
           // console.log(prod.value)
            let len = find.items.length;
            let prodId = cartInfo.items[0].productId;
            for (let i = 0; i < len; i++) {
                if (prodId == find.items[i].productId) {
                   
                    let prod2 = await productModel.findOne({ _id: prodId });
                    find.totalPrice =
                        Number(find.totalPrice) +
                        Number(prod2.price) * Number(cartInfo.items[0].quantity);
                        find.items[i].quantity = Number(find.items[i].quantity) + Number(cartInfo.items[0].quantity)
                       
                    prod.value = 1;
                    find.save();
                    
                    break;
                     }
                 }   
                   if (prod.value === 0) {
                       find.items.push(cartInfo.items[0]);
                        find.totalItems++;
                        let prod2 = await productModel.findOne({ _id: cartInfo.items[0].productId });
                        find.totalPrice =
                            Number(find.totalPrice) +
                            Number(prod2.price) * Number(cartInfo.items[0].quantity);
                            find.save();
                    }
                    
                    return res.status(200).send({status: true, msg: "Successful", data: find})
                
            
        }
    } catch (err) {
       // console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
};

const updateCart = async (req, res) => {
    try {
        let parUserId = req.params.userId;
        if (!parUserId) {
            return res.status(400).send({ status: true, message: "Please " });
        }
        // if(!(req.userId == parUserId)){
        //     return res.status(400).send({status: true, message:"You are not authorised to update Cart"})
        // }

        let { cartId, productId, removeProduct } = req.body;
        console.log(cartId);
        let find = await cartModel.findOne({ _id: cartId });
        let len = find.items.length;
        if (!find) {
            return res
                .status(400)
                .send({ status: true, message: "This Cart id Does Not Exist" });
        }

        for (let i = 0; i < len; i++) {
            if (productId == find.items[i].productId) {
                if (removeProduct == 1) {
                    let prod = await productModel.findOne({ _id: productId });
                    find.totalPrice = Number(find.totalPrice) - Number(prod.price);
                    find.items[i].quantity -= 1;

                    if (find.items[i].quantity == 0) {
                        find.items.splice(i, 1);
                        find.totalItems -= 1;
                    }
                    find.save();
                    break;
                } else {
                    let prod2 = await productModel.findOne({ _id: productId });
                    find.totalPrice =
                        Number(find.totalPrice) -
                        Number(find.items[i].quantity) * Number(prod2.price);
                    find.items.splice(i, 1);
                    find.totalItems -= 1;
                    find.save();
                    if (find.items.length == 0) {
                        find.totalPrice = 0;
                        //find.save();
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
    const totalItems = items.length
    let empArr = items.pop()

    // for (let i=0;i<items.length;i++) {
    //     let newArr = items.splice(i,items.length)
    //     empArr = newArr
    //     break;
    // }

    
    cartFound.items = empArr

    return res.status(200).send({status :true, message:'Cart deleted successfully', data:cartFound})

    }
    catch(err) {
        return res.status(500).send({status:false, message:err.message})
    }
}































module.exports = {createCart, updateCart, getCart, deleteCart}
