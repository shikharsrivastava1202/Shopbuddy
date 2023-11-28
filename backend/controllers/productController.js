const Product = require("../models/productmodel");
const ErrorHandler = require("../utils/errorhandler");
const catchasyncerror = require("../middleware/catchasyncerror");
const ApiFeatures = require("../utils/apifeatures");


//create product -- Admin route

exports.createProduct = catchasyncerror(async (req,res,next)=>{

    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    });

});

//get all products

exports.getAllProducts = catchasyncerror(async(req,res)=>{

    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter();

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query;

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

//get product details

exports.getProductDetails = catchasyncerror(async (req,res,next)=>{

    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        product,
        productsCount
    })
});

//update product -- Admin route 

exports.updateProduct = catchasyncerror(async (req,res,next)=>{

    let product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product not found",404));
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindandModify:false
    });

    res.status(200).json({
        success:true,
        product
    })
});

// delete a product -- Admin route

exports.deleteProduct = catchasyncerror(async (req,res,next)=>{

    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product not found",404));
    }

    await product.remove();

    res.status(200).json({
        success:true,
        message:"Product deleted Successfully!",
    })
});

//Create a new review or updating a review

exports.createProductReview = catchasyncerror(async(req,res,next)=>{

    const {rating, comment, productID}=req.body;

    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    };

    const product = await Product.findById(productID);

    const isReviewed = product.reviews.find(
        rev=>rev.user.toString() === req.user._id.toString()
    );

    if(isReviewed){
        product.reviews.forEach(rev =>{
            if(rev=>rev.user.toString() === req.user._id.toString()){
                (rev.rating=rating),(rev.comment=comment);
            }
        });
    }
    else{
        product.reviews.push(review);
        product.numOfreviews=product.reviews.length
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
});


// Get All Reviews of a product
exports.getProductReviews = catchasyncerror(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
});


// Delete Review
exports.deleteReview = catchasyncerror(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
});