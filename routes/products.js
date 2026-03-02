const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticateUser = require('../middleware/auth');

// Apply authentication middleware to all product routes
router.use(authenticateUser);

// GET all products for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, minPrice, maxPrice, search } = req.query;
    
    // Build filter for user's products only
    let filter = { 
      user: req.user._id,
      isActive: true 
    };
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        productsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
});

// GET product by ID (only if it belongs to the authenticated user)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to access it'
      });
    }
    
    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
});

// CREATE new product for the authenticated user
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, stock, brand, sku, images, tags } = req.body;
    
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }
    
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      brand,
      sku,
      images,
      tags,
      user: req.user._id  // Associate product with authenticated user
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message
    });
  }
});

// UPDATE product by ID (only if it belongs to the authenticated user)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category, stock, brand, sku, images, tags, isActive } = req.body;
    
    // Check if SKU already exists (excluding current product)
    if (sku) {
      const existingProduct = await Product.findOne({ 
        sku, 
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }
    
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, description, price, category, stock, brand, sku, images, tags, isActive },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to update it'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message
    });
  }
});

// DELETE product (soft delete) - only if it belongs to the authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to delete it'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deactivated successfully',
      data: product
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating product',
      error: error.message
    });
  }
});

// GET products by category for the authenticated user
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const products = await Product.find({ 
      category: category.toLowerCase(), 
      user: req.user._id,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments({ 
      category: category.toLowerCase(), 
      user: req.user._id,
      isActive: true 
    });
    
    res.status(200).json({
      success: true,
      message: `Products in ${category} category retrieved successfully`,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        productsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products by category',
      error: error.message
    });
  }
});

// SEARCH products for the authenticated user
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const products = await Product.find({
      $and: [
        { user: req.user._id },
        { isActive: true },
        { $text: { $search: query } }
      ]
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments({
      $and: [
        { user: req.user._id },
        { isActive: true },
        { $text: { $search: query } }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Products found successfully',
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        productsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching products',
      error: error.message
    });
  }
});

module.exports = router;
