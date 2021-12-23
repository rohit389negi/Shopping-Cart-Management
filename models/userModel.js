const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  fname: {

    type: String, 
    required: true

    },
  lname: {

    type: String, 
    required: [true,'Enter a name'],
    trim: true

    },
  email: {

    type: String, 
    required: true, 
    unique:true
  },

  profileImage: {
      type: String, 
    required: true
    }, // s3 link

  phone: {
    type: String, 
    required: true, 
    unique:true 

    }, 
  password: {

    type: String, 
    required: true, 
    // minlength: 8,
    // maxlength: 15,
    trim: true

    },// encrypted password


  address: {
    shipping: {

      street: {
        type: String, 
        required: true

        },
      city: {

        type: String, 
        required: true

        },
      pincode: {

        type: String, 
        required: true

        }
    },
    billing: {
        street: {
        type: String, 
        required: true
      },
    city: {
        type: String, 
        required: true
      },

      pincode: {
        type: Number, 
        required: true}
    }
  },
 
});

module.exports = mongoose.model('myUser',userSchema)