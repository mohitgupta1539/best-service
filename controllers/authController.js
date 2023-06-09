import userModel from "../models/userModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import queryTextModel from "../models/queryTextModel.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer, role } = req.body;

    if (!name) {
      return res.send({ message: "Name is required" });
    }
    if (!email) {
      return res.send({ message: "Email is required" });
    }
    if (!password) {
      return res.send({ message: "Password is required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is required" });
    }
    if (!address) {
      return res.send({ message: "Address is required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is required" });
    }

    // check user
    const existingUser = await userModel.findOne({ email });

    //existing user
    if (existingUser) {
      res.status(200).send({
        success: false,
        message: "Already registered please Login",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);

    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
      role,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

//POST LOGIN  pehle route create kar lete hai
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }

    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    }); // create middle for authenticated user using token
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgot password Controller
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword, role } = req.body;
    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "Password is required" });
    }

    //check
    const user = await userModel.findOne({ email, answer, role });

    if (!user) {
      res
        .status(404)
        .send({ success: false, message: "Email or answer is not Correct" });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//update profile Controller
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);

    //check password
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and atleat 6 character password",
      });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updateUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updateUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating profile",
      error,
    });
  }
};

//get all User Details
export const getAllUserDetailsController = async (req, res) => {
  try {
    const userDetails = await userModel
      .find({})
      .select("-answer")
      .select("-password")
      .select("-updatedAt");
    res.status(200).send({
      success: true,
      message: "All Users List",
      userDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all User Details",
      error,
    });
  }
};

export const contactQueryRegisterController = async (req, res) => {
  try {
    const { name, email, phone, queryText} = req.body;

    if (!name) {
      return res.send({ message: "Name is required" });
    }
    if (!email) {
      return res.send({ message: "Email is required" });
    }
    
    if (!phone) {
      return res.send({ message: "Phone no is required" });
    }
    if (!queryText) {
      return res.send({ message: "Address is required" });
    }

    

    //register query
    //save
    const query = await new queryTextModel({
      name,
      email,
      phone,
      queryText,
    }).save();

    res.status(201).send({
      success: true,
      message: "Query Registered Successfully",
      query,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Sending Query",
      error,
    });
  }
};

//get all Query Details
export const getAllQueryDetailsController = async (req, res) => {
  try {
    const queryDetails = await queryTextModel
      .find({})
      .select("-updatedAt");
    res.status(200).send({
      success: true,
      message: "All Query List",
      queryDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all Query Details",
      error,
    });
  }
};

// test Controller
export const testController = (req, res) => {
  console.log("Protected Route");
  res.send("Protected Route");
};
