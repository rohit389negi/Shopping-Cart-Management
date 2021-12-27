const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const middlewares = require('../middlewares/appMiddleware')


const middleware = require('../middlewares/appMiddleware')

router.post('/register', userController.registerUser)
router.post('/login', userController.Login)

router.get('/user/:userId/profile', middlewares.auth, userController.getUserData)
router.put('/user/:userId/profile', middlewares.auth,userController.updateUserData)

router.post('/Products', productController.addProduct)
router.get('/products', productController.getProduct)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteproductByID)





module.exports = router
