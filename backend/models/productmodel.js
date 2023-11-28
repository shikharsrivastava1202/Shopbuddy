const mongoose = require("mongoose");

const productschema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter Product Name"]
    },
    description:{
        type:String,
        required:[true, "Please enter Product Description"]
    },
    price:{
        type:Number,
        required:[true,"Please enter Product Price"],
        maxLength:[8,"Price can't exceed 8 characters"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        } 
        }
    ],
    catagory:{
        type:String,
        required:[true,"Please enter catagory"] 
    },
    stock:{
        type:Number,
        required:[true,"Please enter the amount of stocks"],
        maxLength:[4,"Stock can not exceed 4 characters"],
        default:1
    },
    numOfreviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },

    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Product",productschema); 