// controllers/searchController.js
const Part = require('../models/SearchParts');
const { validationResult } = require('express-validator');

exports.searchParts = async (req, res) => {
  try {
    const {
      q = '',           // search query
      category = '',    // filter by category
      brand = '',       // filter by brand
      minPrice = 0,     // minimum price
      maxPrice = 10000, // maximum price
      inStock = null,   // in stock filter
      sortBy = 'bestValue', // sort option
      sortOrder = 'DESC',   // sort order
      page = 1,         // page number
      limit = 20        // items per page
    } = req.query;

    // Validate numeric parameters
    const validatedMinPrice = Math.max(0, parseFloat(minPrice) || 0);
    const validatedMaxPrice = Math.min(10000, parseFloat(maxPrice) || 10000);
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const searchParams = {
      query: q.trim(),
      category: category.trim(),
      brand: brand.trim(),
      minPrice: validatedMinPrice,
      maxPrice: validatedMaxPrice,
      inStock: inStock === 'true' ? true : inStock === 'false' ? false : null,
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      page: validatedPage,
      limit: validatedLimit
    };

    const result = await Part.search(searchParams);

    res.json({
      success: true,
      data: result.parts,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      },
      filters: {
        query: q,
        category,
        brand,
        minPrice: validatedMinPrice,
        maxPrice: validatedMaxPrice,
        inStock,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Search parts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error during search' 
    });
  }
};

exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;

    if (!q.trim()) {
      return res.json({ success: true, suggestions: [] });
    }

    const suggestions = await Part.getSearchSuggestions(q.trim(), parseInt(limit));

    res.json({
      success: true,
      suggestions: suggestions.map(item => ({
        name: item.name,
        brand: item.brand,
        category: item.category,
        display: `${item.brand} ${item.name} (${item.category})`
      }))
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

exports.getPopularSearches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularSearches = await Part.getPopularSearches(parseInt(limit));

    res.json({
      success: true,
      popularSearches: popularSearches.map(item => ({
        name: item.name,
        brand: item.brand,
        category: item.category,
        reviews: item.reviews
      }))
    });

  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

exports.getSearchFilters = async (req, res) => {
  try {
    const [brands, categories] = await Promise.all([
      Part.getBrands(),
      Part.getCategories()
    ]);

    // Price ranges for filter options
    const priceRanges = [
      { label: 'Under $25', value: '0-25' },
      { label: '$25 - $50', value: '25-50' },
      { label: '$50 - $100', value: '50-100' },
      { label: '$100 - $200', value: '100-200' },
      { label: 'Over $200', value: '200-10000' }
    ];

    // Sort options
    const sortOptions = [
      { value: 'bestValue', label: 'Best Value' },
      { value: 'priceLow', label: 'Price: Low to High' },
      { value: 'priceHigh', label: 'Price: High to Low' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'reviews', label: 'Most Reviews' },
      { value: 'name', label: 'Name A-Z' }
    ];

    res.json({
      success: true,
      filters: {
        brands,
        categories,
        priceRanges,
        sortOptions,
        inStockOptions: [
          { value: 'true', label: 'In Stock' },
          { value: 'false', label: 'Out of Stock' }
        ]
      }
    });

  } catch (error) {
    console.error('Get search filters error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

exports.searchParts = async (req, res) => {
  try {
    const {
      q = '',           // part name search (e.g., "oil filter")
      category = '',    // filter by category
      brand = '',       // filter by brand
      year = '',        // vehicle year
      make = '',        // vehicle make
      model = '',       // vehicle model
      minPrice = 0,     // minimum price
      maxPrice = 10000, // maximum price
      inStock = null,   // in stock filter
      sortBy = 'bestValue', // sort option
      sortOrder = 'DESC',   // sort order
      page = 1,         // page number
      limit = 20        // items per page
    } = req.query;

    // Validate numeric parameters
    const validatedMinPrice = Math.max(0, parseFloat(minPrice) || 0);
    const validatedMaxPrice = Math.min(10000, parseFloat(maxPrice) || 10000);
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const searchParams = {
      query: q.trim(),
      category: category.trim(),
      brand: brand.trim(),
      year: year.trim(),
      make: make.trim(),
      model: model.trim(),
      minPrice: validatedMinPrice,
      maxPrice: validatedMaxPrice,
      inStock: inStock === 'true' ? true : inStock === 'false' ? false : null,
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      page: validatedPage,
      limit: validatedLimit
    };

    // Choose the appropriate search method based on what parameters are provided
    let result;
    if (year && make && model) {
      // Search with vehicle compatibility
      const vehicleInfo = { year, make, model };
      result = await Part.searchByVehicleAndName(vehicleInfo, searchParams);
    } else {
      // General search without vehicle
      result = await Part.search(searchParams);
    }

    res.json({
      success: true,
      data: result.parts,
      vehicle: result.vehicle || null,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      },
      filters: {
        query: q,
        category,
        brand,
        year,
        make,
        model,
        minPrice: validatedMinPrice,
        maxPrice: validatedMaxPrice,
        inStock,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Search parts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error during search' 
    });
  }
};