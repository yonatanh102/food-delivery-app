const userModel = require('../models/users');

const getUsers = async () => {
    return await userModel.find();
}

const getUserById = async (id) => {
    return await userModel.findById(id);
}

const createUser = async (userData) => {
    const newUser = new userModel(userData);
    return await newUser.save();
}

const updateUser = async (id, userData) => {
    return await userModel.findByIdAndUpdate(id, userData, { new: true });
}

const deleteUser = async (id) => {
    return await userModel.findByIdAndDelete(id);
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}