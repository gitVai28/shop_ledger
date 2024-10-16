const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/User");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMsg = "Auth failed email or password is wrong";
    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(403).json({ message: errorMsg, success: false });
    }
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({
      message: "login successfully",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password,shopName, shopAddress, phoneNo} = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ message: "user is already exits", success: false });
    }
    const userModel = new UserModel({ name, email, password, shopName, shopAddress, phoneNo });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    res
      .status(201)
      .json({ message: "user created successfully", success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getUserDetails = async (req, res) => {
  try {
    // Get user ID from the decoded JWT (which was set in ensureAuthenticated middleware)
    const userId = req.user._id;
    
    // Fetch user details from the database by user ID, excluding the password
    const user = await UserModel.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Return user details
    res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  signup,
  login,
  getUserDetails
};
