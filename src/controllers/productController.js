const validator = require('../validation/validator')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const awsFunction = require('../controllers/awsControllers')


let addProduct = async function (req, res) {
    try {
        let reqBody = req.body
        reqBody.currencyId = "INR"
        reqBody.currencyFormat = "₹"
        
        
        let files = req.files

        if (!validator.isValidRequestBody(reqBody)) {
            res.status(400).send({ status: false, message: "request body is required" })
            return
        }

        let { title, description, price, availableSizes } = reqBody

        if (!validator.isValid(title)) {
            res.status(400).send({ status: false, message: "enter valid title" })
            return
        }

        if (!validator.isValid(description)) {
            res.status(400).send({ status: false, message: "enter valid description" })
            return
        }

        if (!validator.isValid(price)) {
            res.status(400).send({ status: false, message: "price is required" })
            return
        }


        if (!validator.isAvailableSizes(availableSizes)) {
            res.status(400).send({ status: false, message: "select size from available sizes " })
            return
        }

        let findTitle = await productModel.findOne({ title })
        
        if (findTitle) {
            res.status(403).send({ status: false, message: "product with this title already exist it must be unique" })
            return
        }

        if (files && files.length > 0) {
            let uploadedFileURL = await awsFunction.uploadFile(files[0])
            reqBody.productImage = uploadedFileURL

            let createProduct = await productModel.create(reqBody)
            
            res.status(201).send({ status: true, message: `product ${title} created successfully`, data: createProduct })
            return
        } else {
            res.status(400).send({ status: false, message: "Please Provide Profile Images" })
            return
        }
    } catch (error) {
        res.status(500).send({ seatus: false, message: error.message })
    }
}

// get product by query localhost:3000/products
const getProduct = async function (req, res) {
    try {
const {size, name, priceGreaterThan, priceLessThan} = req.query
        if (size || name || priceGreaterThan || priceLessThan) {

            obj = {}
            if (size) {
                obj.availableSizes = size
            }
            if (name) {
                obj.title = { $regex: name}
            
               // obj.title = { $regex: '.*' + title.toLowerCase() + '.*' }
            }
            if (priceGreaterThan) {
                obj.price = { $gt: priceGreaterThan }
            }
            if (priceLessThan) {
                obj.price = { $lt: priceLessThan }
            }
            obj.isDeleted = false
            obj.deletedAt = null
            const getProductsList = await productModel.find(obj).sort({ price: 1 })

            if (!getProductsList || getProductsList.length == 0) {
                res.status(400).send({ status: false, message: `product is not available right now.` })
            } else {
                res.status(200).send({ status: true, message: 'Success', data: getProductsList })
            }
        } else {
            const getListOfProducts = await productModel.find({ isDeleted: false, deletedAt: null }).sort({ price: 1 })
            res.status(200).send({ status: true, message: 'Success', data: getListOfProducts })
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

}

//get product Delails by id localhost:3000/products/:productId
const getProductById = async function (req, res) {
    try {
        let id = req.params.productId

        if (!validator.isValidObjectId(id)) {
            res.status(400).send({ status: false, message: `${id} is not valid Product id ` });
            return;
        }

        let findPro = await productModel.findOne({ _id: id,isDeleted: false, deletedAt: null  })
        if (!findPro) {
            res.status(404).send({ status: false, message: `product is not available with this ${id} id` })
            return
        }
        res.status(200).send({ status: true, message: "Success", data: findPro })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//update product by id  localhost:3000/products/:productId
const updateProduct = async function (req, res) {
    try {

        let productId = req.params.productId;
        const requestBody = req.body;
        const productImage = req.files

        // if (!validator.isValidRequestBody(requestBody)) {
        //     return res.status(400).send({ status: false, message: 'No paramateres passed. product unmodified' })
        // }
        if (!validator.isValidObjectId(productId)) {
            res.status(400).send({ status: false, message: `${productId} is not valid Product id ` });
            return;
        }

        let productDetails = await productModel.findOne({ _id: req.params.productId , isDeleted:false})


        if (!productDetails) {
            return res.status(404).send({ status: false, message: `productDetails not found with given ProductId or May be Deleted` })
        }
        const { title } = requestBody

         const istitleAlreadyUsed = await productModel.findOne({ title });

         if (istitleAlreadyUsed) {
                res.status(400).send({ status: false, message: `${title} these title is already Used` })
                return
        }
        

        if (productImage && productImage.length > 0) {
            var uploadedFileURL = await awsFunction.uploadFile(productImage[0]);
            requestBody.productImage = uploadedFileURL
        };



       // const productValue = { title, description, price,isFreeShipping, currencyId, currencyFormat, productImage: uploadedFileURL, style, availableSizes, installments }

        const upatedProduct = await productModel.findOneAndUpdate({ _id: productId }, requestBody, { new: true })
        res.status(200).send({ status: true, message: 'User updated successfully', data: upatedProduct });


    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//delete product by Id
const deleteproductByID = async (req, res) => {
    try {

        const params = req.params.productId;

        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Inavlid productID." })
        }

        const findproduct = await productModel.findById({ _id: params })

        if (!findproduct) {

            return res.status(404).send({ status: false, message: `No product found ` })

        }

        else if (findproduct.isDeleted == true) {
            return res.status(400).send({ status: false, message: `product has been already deleted.` })
        } else {
            const deleteData = await productModel.findOneAndUpdate({ _id: { $in: findproduct } }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });
            return res.status(200).send({ status: true, message: "product deleted successfullly.", data: deleteData })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

module.exports = { addProduct, getProduct, getProductById, updateProduct, deleteproductByID } 