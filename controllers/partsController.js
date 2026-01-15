// controllers/partsController.js
const Part = require('../models/Part');
// const { validationResult } = require('express-validator'); // Removed express-validator

exports.getParts = async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, inStock, sortBy } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (inStock !== undefined) filters.inStock = inStock === 'true';
    if (sortBy) filters.sortBy = sortBy;

    const parts = await Part.findAll(filters);
    res.json(parts);
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    res.json(part);
  } catch (error) {
    console.error('Error fetching part:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Part.getBrands();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Part.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createPart = async (req, res) => {
  try {
    const { 
      name, brand, price, original_price, rating, reviews, is_oem, seller,
      shipping, warranty, in_stock, image_url, best_value_score, features,
      compatibility, category
    } = req.body;

    const errors = [];

    // Manual validation for required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Part name is required' });
    }
    if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
      errors.push({ field: 'brand', message: 'Brand is required' });
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      errors.push({ field: 'price', message: 'Price must be a positive number' });
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      errors.push({ field: 'category', message: 'Category is required' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Manual type conversion and cleanup for optional fields
    const partData = {
      name: name.trim(),
      brand: brand.trim(),
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      rating: rating ? parseFloat(rating) : 0,
      reviews: reviews ? parseInt(reviews) : 0,
      is_oem: typeof is_oem === 'string' ? is_oem.toLowerCase() === 'true' : !!is_oem,
      seller: seller ? seller.trim() : null,
      shipping: shipping ? shipping.trim() : null,
      warranty: warranty ? warranty.trim() : null,
      in_stock: typeof in_stock === 'string' ? in_stock.toLowerCase() === 'true' : !!in_stock,
      image_url: image_url || null,
      best_value_score: best_value_score ? parseFloat(best_value_score) : null,
      features: Array.isArray(features) ? features : (typeof features === 'string' && features.length > 0 ? features.split(',').map(f => f.trim()) : []),
      compatibility: Array.isArray(compatibility) ? compatibility : (typeof compatibility === 'string' && compatibility.length > 0 ? compatibility.split(',').map(c => c.trim()) : []),
      category: category.trim()
    };

    const part = await Part.create(partData);
    res.status(201).json(part);
  } catch (error) {
    console.error('Error creating part:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePart = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, brand, price, original_price, rating, reviews, is_oem, seller,
      shipping, warranty, in_stock, image_url, best_value_score, features,
      compatibility, category
    } = req.body;

    const errors = [];
    const partData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Part name must be a non-empty string' });
      } else {
        partData.name = name.trim();
      }
    }

    if (brand !== undefined) {
      if (typeof brand !== 'string' || brand.trim().length === 0) {
        errors.push({ field: 'brand', message: 'Brand must be a non-empty string' });
      } else {
        partData.brand = brand.trim();
      }
    }

    if (price !== undefined) {
      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        errors.push({ field: 'price', message: 'Price must be a positive number' });
      } else {
        partData.price = parseFloat(price);
      }
    }

    if (original_price !== undefined) {
      if (isNaN(parseFloat(original_price)) || parseFloat(original_price) <= 0) {
        errors.push({ field: 'original_price', message: 'Original price must be a positive number' });
      } else {
        partData.original_price = parseFloat(original_price);
      }
    }

    if (rating !== undefined) {
      if (isNaN(parseFloat(rating)) || parseFloat(rating) < 0 || parseFloat(rating) > 5) {
        errors.push({ field: 'rating', message: 'Rating must be between 0 and 5' });
      } else {
        partData.rating = parseFloat(rating);
      }
    }

    if (reviews !== undefined) {
      if (isNaN(parseInt(reviews)) || parseInt(reviews) < 0) {
        errors.push({ field: 'reviews', message: 'Reviews must be a non-negative integer' });
      } else {
        partData.reviews = parseInt(reviews);
      }
    }

    if (is_oem !== undefined) {
      partData.is_oem = typeof is_oem === 'string' ? is_oem.toLowerCase() === 'true' : !!is_oem;
    }

    if (seller !== undefined) {
      partData.seller = seller.trim();
    }

    if (shipping !== undefined) {
      partData.shipping = shipping.trim();
    }

    if (warranty !== undefined) {
      partData.warranty = warranty.trim();
    }

    if (in_stock !== undefined) {
      partData.in_stock = typeof in_stock === 'string' ? in_stock.toLowerCase() === 'true' : !!in_stock;
    }

    if (image_url !== undefined) {
      // Basic URL validation
      try {
        new URL(image_url);
        partData.image_url = image_url;
      } catch (e) {
        errors.push({ field: 'image_url', message: 'Image URL must be a valid URL' });
      }
    }

    if (best_value_score !== undefined) {
      if (isNaN(parseFloat(best_value_score)) || parseFloat(best_value_score) < 0 || parseFloat(best_value_score) > 10) {
        errors.push({ field: 'best_value_score', message: 'Best value score must be between 0 and 10' });
      } else {
        partData.best_value_score = parseFloat(best_value_score);
      }
    }

    if (features !== undefined) {
      partData.features = Array.isArray(features) ? features : (typeof features === 'string' && features.length > 0 ? features.split(',').map(f => f.trim()) : []);
    }

    if (compatibility !== undefined) {
      partData.compatibility = Array.isArray(compatibility) ? compatibility : (typeof compatibility === 'string' && compatibility.length > 0 ? compatibility.split(',').map(c => c.trim()) : []);
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        errors.push({ field: 'category', message: 'Category must be a non-empty string' });
      } else {
        partData.category = category.trim();
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const updatedPart = await Part.update(id, partData);

    if (!updatedPart) {
      return res.status(404).json({ error: 'Part not found' });
    }

    res.json(updatedPart);
  } catch (error) {
    console.error('Error updating part:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePart = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPart = await Part.delete(id);

    if (!deletedPart) {
      return res.status(404).json({ error: 'Part not found' });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting part:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllPartsAdmin = async (req, res) => {
  try {
    const { category, brand, inStock, sortBy, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (inStock !== undefined) filters.inStock = inStock === 'true';
    if (sortBy) filters.sortBy = sortBy;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const parts = await Part.findAll({ ...filters, limit: parseInt(limit), offset });
    
    res.json(parts);
  } catch (error) {
    console.error('Error fetching all parts for admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};