const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler.js");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const {
  generateFromEmail,
  generateUsername,
} = require("unique-username-generator");
const bcrypt = require("bcryptjs");
const sendEmailMessage = require("../utils/sendEmail");
const { response } = require("express");

const JWT_SIGNING_KEY = process.env.JWT_SIGNING_KEY;

//login with google
const client = new OAuth2Client({
  clientId: process.env.NODE_APP_GOOGLE_CLIENT_ID,
});

const loginWithGoogle = catchAsyncErrors(async (req, res, next) => {
  const { tokenId } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.NODE_APP_GOOGLE_CLIENT_ID,
  });
  try {
    const { email, email_verified, name } = ticket.getPayload();
    const username = generateFromEmail(email, 3);
    if (email_verified) {
      let user = await User.findOne({ email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(
          username + generateUsername(),
          10
        );
        user = await User.create({
          name,
          email,
          username,
          password: hashedPassword,
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const tokenId = jwt.sign(data, JWT_SIGNING_KEY);
      const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
      };
      res.cookie("auth-token", tokenId, options);
      res.status(201).json({ tokenId, user });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// register
const register = catchAsyncErrors(async (req, res, next) => {
  const { name, username, email, phone_number, password, role } = req.body;
  try {
    if (role === "Admin") {
      return next(
        new ErrorHandler(
          "Invalid role assignment. Direct assignment of 'Admin' role is not allowed.",
          401
        )
      );
    }

    if (phone_number.toString().length !== 10) {
      return next(
        new ErrorHandler(
          "Invalid phone number. Please enter a 10-digit mobile number.",
          403
        )
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = Date.now() + 15 * 60 * 1000;

    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      phone_number,
      otp,
      expire,
    });

    await fetch(
      `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?dr=false&sender=FRICOZ&recipient=${phone_number}&msg=Dear Customer, Your OTP for mobile number verification is ${otp}. Please do not share this OTP to anyone - Firstricoz Pvt. Ltd.&user=FIRSTR&pswd=First^01&PE_ID=1601832170235925649&Template_ID=1607100000000306120`
    );

    res.status(200).json({
      message: `OTP has been sent to the mobile number ending in ${phone_number
        .toString()
        .slice(-4)}.`,
      success: true,
      data: {
        name,
        email,
        username,
        phone_number,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const resendOtp = catchAsyncErrors(async (req, res, next) => {
  const { phone_number, email } = req.body;

  try {
    let user = await User.findOne({ phone_number, email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = Date.now() + 15 * 60 * 1000;

    user.otp = otp;
    user.expire = expire;
    await user.save();

    await fetch(
      `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?dr=false&sender=FRICOZ&recipient=${phone_number}&msg=Dear Customer, Your OTP for mobile number verification is ${otp}. Please do not share this OTP to anyone - Firstricoz Pvt. Ltd.&user=FIRSTR&pswd=First^01&PE_ID=1601832170235925649&Template_ID=1607100000000306120`
    );

    res.status(200).json({
      message: `OTP has been resent to the mobile number ending in ${phone_number.slice(
        -4
      )}.`,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const verifyMobileOtp = catchAsyncErrors(async (req, res, next) => {
  const { phone_number, otp } = req.body;
  const user = await User.findOne({
    phone_number,
    otp,
    expire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  user.otp = undefined;
  user.expire = undefined;
  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };
  const tokenId = jwt.sign(data, JWT_SIGNING_KEY);
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  res.cookie("auth-token", tokenId, options);
  res.status(201).json({ tokenId, user });
});

// login
const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userCheck = await User.findOne({ email: email }).select("+password");
    if (!userCheck) {
      return next(
        new ErrorHandler(
          "User not found. Please check your email and try again.",
          404
        )
      );
    }

    const passwordMatch = await bcrypt.compare(password, userCheck.password);

    if (!passwordMatch) {
      return next(new ErrorHandler("Invalid credentials.", 401));
    }

    const data = {
      user: {
        id: userCheck._id,
      },
    };

    const tokenId = jwt.sign(data, JWT_SIGNING_KEY);
    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    res.cookie("auth-token", tokenId, options);
    res.status(200).json({ tokenId, user: userCheck });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const loginWithFacebook = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id, displayName, _json } = req.user;
    let user = await User.findOne({ facebook_id: id });
    if (!user) {
      const username = generateUsername(_json.first_name + _json.last_name);
      const hashedPassword = await bcrypt.hash(
        username + generateUsername(),
        10
      );
      const email = _json?.email || id + "@facebook.com";
      user = await User.create({
        name: displayName,
        username,
        email,
        facebook_id: id,
        password: hashedPassword,
      });
    }
    const data = {
      user: {
        id: user.id,
      },
    };

    const tokenId = jwt.sign(data, JWT_SIGNING_KEY);
    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    res.cookie("auth-token", tokenId, options);
    res.status(201).json({ tokenId, user });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
});

const updateProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, phone_number, email, username } = req.body;

    const usernameCheck = await User.findOne({ username });
    if (
      usernameCheck &&
      usernameCheck._id.toString() !== req.user.id.toString()
    ) {
      return next(new ErrorHandler("Username is already taken.", 400));
    }

    const emailCheck = await User.findOne({ email });
    if (emailCheck && emailCheck._id.toString() !== req.user.id.toString()) {
      return next(new ErrorHandler("Email is already taken.", 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone_number,
        email,
        username,
      },
      { new: true, runValidators: true }
    );

    // Check if the user was found and updated
    if (!updatedUser) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("auth-token", "", { expires: new Date(0), httpOnly: true });
  res.status(200).json({ message: "Logout successful" });
});

const sendOtp = catchAsyncErrors(async (req, res, next) => {
  const email = req.body.email;
  try {
    const userCheck = await User.findOne({ email: email });

    if (!userCheck) {
      return next(new ErrorHandler("User not found", 404));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = Date.now() + 15 * 60 * 1000; // OTP expiration time (15 minutes)

    // Save the OTP and its expiration time to the user document
    userCheck.otp = otp;
    userCheck.expire = expire;
    await userCheck.save();

    const mailOptions = {
      email: email,
      subject: "Password Reset OTP",
      message: `<p>Dear ${userCheck.name}!,<br>Your OTP for password reset is: <strong>${otp}</strong>.<br> Please use this OTP to reset your password.</p>`,
    };

    await sendEmailMessage(mailOptions);
    res.json({
      message: `An OTP has been sent to ${email}. Please check your email and use the OTP to reset your password.`,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const verifyOtp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isOtpValid = user.otp === otp && user.expire > Date.now();

    if (isOtpValid) {
      user.otp_verified = "verified";
      await user.save();
      return res.json({ message: "OTP verification successful" });
    } else {
      return next(
        new ErrorHandler(
          "Invalid OTP or expired. Please request a new OTP.",
          401
        )
      );
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (user.otp_verified !== "verified") {
      return next(
        new ErrorHandler(
          "Please verify your OTP before attempting this action. Check your email for the verification code.",
          401
        )
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.expire = undefined;
    user.otp_verified = undefined;
    await user.save();

    res.json({ message: "Your password has been successfully reset." });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatch) {
      return next(new ErrorHandler("Incorrect current password", 401));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      message:
        "Your password has been successfully changed. You can now use your new password to log in.",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const userProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const createAddress = catchAsyncErrors(async (req, res, next) => {
  const { street, city, state, postal_code, country } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    user.address.push({ street, city, state, postal_code, country });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const updateAddress = catchAsyncErrors(async (req, res, next) => {
  const { addressId } = req.params;
  const { street, city, state, postal_code, country } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const address = user.address.id(addressId);

    if (!address) {
      return next(new ErrorHandler("Address not found", 404));
    }

    address.street = street ? street : address.street;
    address.city = city ? city : address.city;
    address.state = state ? state : address.state;
    address.postal_code = postal_code ? postal_code : address.postal_code;
    address.country = country ? country : address.country;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const deleteAddress = catchAsyncErrors(async (req, res, next) => {
  const { addressId } = req.params;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const address = user.address.id(addressId);

    if (!address) {
      return next(new ErrorHandler("Address not found", 404));
    }

    await user.address.pull(addressId);

    await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

const getSingleUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = {
  loginWithGoogle,
  register,
  login,
  loginWithFacebook,
  updateProfile,
  logout,
  sendOtp,
  verifyOtp,
  resetPassword,
  changePassword,
  userProfile,
  createAddress,
  updateAddress,
  deleteAddress,
  getSingleUser,
  verifyMobileOtp,
  resendOtp,
};
