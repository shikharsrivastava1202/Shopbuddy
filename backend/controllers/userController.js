const ErrorHandler = require("../utils/errorhandler");
const catchasyncerror = require("../middleware/catchasyncerror");
const User = require("../models/usermodel");
const sendtoken = require("../utils/jwttoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


// register a user
exports.registerUser = catchasyncerror( async(req,res,next)=>{

    const {name, email, password} = req.body;

// be extremelly carefull with naming the variables
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"sample id",
            url:"sample url"
        },
    });

    
//assigning a token to the new user    
    const token = user.getJWTToken();


//converted into a function 
//const sendtoken = require("../utils/jwttoken");
    sendtoken(user,201,token);
});


//login for the user
exports.loginUser = catchasyncerror (async (req, res, next)=>{

    const {email, password} = req.body;

    //make a check for both the fields for login
    if(!email || !password)
    {
        //converted into function
        //const ErrorHandler = require("../utils/errorhandler");
        return next(new ErrorHandler("Please enter email and password!",400));
    }

    const user = await User.findOne({ email }).select("+password");

    if(!user)
    {
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const ispasswordmatched = user.comparePassword(password);

    if(!ispasswordmatched)
    {
        return next(new ErrorHandler("Invalid email or password",401));
    }

//converted into a function 
//const sendtoken = require("../utils/jwttoken");
    sendtoken(user,200,token);
});


// Logout User
exports.logout = catchasyncerror(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
  
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
});


// Forgot Password
exports.forgotPassword = catchasyncerror(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
  
     // Get ResetPassword Token
  const resetToken = user.resetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;
  
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: `ShopBuddy Password Recovery`,
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorHandler(error.message, 500));
    }
  });

  //Reset Password token 
  exports.resetPassword = catchasyncerror(async (req, res, next)=>{

    //creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
    
      if (!user) {
        return next(
          new ErrorHandler(
            "Reset Password Token is invalid or has been expired",
            400
          )
        );
      }
    
      if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not password", 400));
      }
    
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
    
      await user.save();
    
      sendtoken(user, 200, res);

  });

  // Get User Detail
exports.getUserDetails = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update User password
exports.updatePassword = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendtoken(user, 200, res);
});

//update user profile
exports.updateProfile = catchasyncerror(async(req,res,next)=>{

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };


  const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });

  res.status(200).json({
    success: true,
  });
});

// Get all users(admin)
exports.getAllUser = catchasyncerror(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
exports.getSingleUser = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});


// update User Role -- Admin
exports.updateUserRole = catchasyncerror(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  //we will remove cloudinary

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});