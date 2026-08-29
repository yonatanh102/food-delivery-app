const userModel = require('../models/users');
const bcrypt = require('bcryptjs');

const getUsers = async () => {
    return await userModel.find();
}

const getUserById = async (id) => {
    return await userModel.findById(id);
}

const getUserByEmail = async (email) => {
    return await userModel.findOne({ email });
}

const getUserByPhone = async (phone) => {
    return await userModel.findOne({ phone });
}

// creating user and hiding thier password
const createUser = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    const newUser = new userModel(userData);
    return await newUser.save();
}

const updateUser = async (id, userData) => {
    return await userModel.findByIdAndUpdate(id, userData, { returnDocument: 'after', runValidators: true });
}

const deleteUser = async (id) => {
    return await userModel.findByIdAndDelete(id);
}

module.exports = {
    getUsers,
    getUserById,
    getUserByEmail,
    getUserByPhone,
    createUser,
    updateUser,
    deleteUser
}