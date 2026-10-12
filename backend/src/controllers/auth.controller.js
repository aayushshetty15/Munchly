const userModel = require('../models/user.model');
const foodPartnerModel = require('../models/foodPartner.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ======================== USER AUTHENTICATION ========================

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isUserAlreadyExist = await userModel.findOne({ email });
    if (isUserAlreadyExist) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, role: 'user' },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      message: "User Registered Successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Register user error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: 'user' },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "User Logged in Successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Login user error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "User logged out successfully",
  });
};

const getMeUser = async (req, res) => {
  res.status(200).json({
    user: {
      _id: req.user._id,
      fullName: req.user.fullName || req.user.name,
      email: req.user.email,
    },
  });
};

// ======================== FOOD PARTNER AUTHENTICATION ========================

const registerFoodPartner = async (req, res) => {
  try {
    const { name, contactName, phone, address, email, password, profileImage, cuisineType } = req.body;

    if (!name || !contactName || !phone || !address || !email || !password) {
      return res.status(400).json({
        message: "Please provide restaurant name, owner name, phone, address, email, and password.",
      });
    }

    const isAccountAlreadyExists = await foodPartnerModel.findOne({ email });
    if (isAccountAlreadyExists) {
      return res.status(400).json({
        message: "A Food Partner with this email already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const foodPartner = await foodPartnerModel.create({
      name,
      contactName,
      phone,
      address,
      email,
      password: hashPassword,
      profileImage: profileImage || '',
      cuisineType: cuisineType || 'Multi-Cuisine',
    });

    const token = jwt.sign(
      { id: foodPartner._id, role: 'partner' },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      message: "Food Partner Registered Successfully",
      token,
      foodPartner: {
        _id: foodPartner._id,
        email: foodPartner.email,
        name: foodPartner.name,
        contactName: foodPartner.contactName,
        phone: foodPartner.phone,
        address: foodPartner.address,
        profileImage: foodPartner.profileImage,
        cuisineType: foodPartner.cuisineType,
      },
    });
  } catch (error) {
    console.error("Register food partner error:", error);
    res.status(500).json({
      message: error.message || "Failed to register Food Partner",
    });
  }
};

const loginFoodPartner = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const foodPartner = await foodPartnerModel.findOne({ email });
    if (!foodPartner) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Await bcrypt compare
    const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: foodPartner._id, role: 'partner' },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Food Partner Logged in Successfully",
      token,
      foodPartner: {
        _id: foodPartner._id,
        email: foodPartner.email,
        name: foodPartner.name,
        contactName: foodPartner.contactName,
        phone: foodPartner.phone,
        address: foodPartner.address,
        profileImage: foodPartner.profileImage,
        cuisineType: foodPartner.cuisineType,
      },
    });
  } catch (error) {
    console.error("Login food partner error:", error);
    res.status(500).json({
      message: error.message || "Failed to log in Food Partner",
    });
  }
};

const logoutFoodPartner = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Food Partner Logged Out Successfully",
  });
};

const getMeFoodPartner = async (req, res) => {
  try {
    const partner = await foodPartnerModel.findById(req.foodPartner._id).select("-password");
    if (!partner) {
      return res.status(404).json({ message: "Food Partner not found" });
    }
    res.status(200).json({ foodPartner: partner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFoodPartnerProfile = async (req, res) => {
  try {
    const { name, contactName, phone, address, profileImage, cuisineType } = req.body;

    const partner = await foodPartnerModel.findById(req.foodPartner._id);
    if (!partner) {
      return res.status(404).json({ message: "Food Partner not found" });
    }

    if (name) partner.name = name;
    if (contactName) partner.contactName = contactName;
    if (phone) partner.phone = phone;
    if (address) partner.address = address;
    if (profileImage !== undefined) partner.profileImage = profileImage;
    if (cuisineType) partner.cuisineType = cuisineType;

    await partner.save();

    res.status(200).json({
      message: "Restaurant profile updated successfully",
      foodPartner: {
        _id: partner._id,
        email: partner.email,
        name: partner.name,
        contactName: partner.contactName,
        phone: partner.phone,
        address: partner.address,
        profileImage: partner.profileImage,
        cuisineType: partner.cuisineType,
      },
    });
  } catch (error) {
    console.error("Update food partner error:", error);
    res.status(500).json({
      message: error.message || "Failed to update restaurant profile",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMeUser,
  registerFoodPartner,
  loginFoodPartner,
  logoutFoodPartner,
  getMeFoodPartner,
  updateFoodPartnerProfile,
};
