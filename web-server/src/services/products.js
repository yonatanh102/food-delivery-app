const productModel = require('../models/products');

const getProducts = async () => {
    return await productModel.find();
}

const getProductById = async (id) => {
    return await productModel.findById(id);
}

const createProduct = async (productData) => {
    const newProduct = new productModel(productData);
    return await newProduct.save();
} 

const updateProduct = async (id, productData) => {
    return await productModel.findByIdAndUpdate(id, productData, { new: true });
}

const deleteProduct = async (id) => {
    return await productModel.findByIdAndDelete(id);
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}