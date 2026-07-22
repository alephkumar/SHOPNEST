// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 120000,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

/* ──────────────────────── helpers ──────────────────────── */
const img = (keyword, n = 1) => {
  const imgs = [];
  for (let i = 0; i < n; i++) {
    const seed = `${keyword}-${i}-${Date.now()}`;
    imgs.push({
      public_id: `seed_${seed}`,
      url: `https://images.unsplash.com/photo-${keyword}?w=600&h=600&fit=crop&q=80`,
    });
  }
  return imgs;
};

// Use stable unsplash image URLs (real photos)
const unsplash = (id, w = 600, h = 600) => ({
  public_id: `unsplash_${id}`,
  url: `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`,
});

const makeReviews = (reviewerIds, reviewsData) =>
  reviewsData.map((r, i) => ({
    user: reviewerIds[i % reviewerIds.length],
    name: r.name,
    rating: r.rating,
    comment: r.comment,
  }));

/* ──────────────────────── seed data ──────────────────────── */
const CATEGORIES = [
  { name: 'Electronics', description: 'Smartphones, laptops, audio gear, cameras and gadgets' },
  { name: 'Fashion', description: 'Clothing, footwear and accessories for men and women' },
  { name: 'Home & Kitchen', description: 'Cookware, decor, furniture and home essentials' },
  { name: 'Books', description: 'Bestsellers, fiction, non-fiction and academic books' },
  { name: 'Sports & Fitness', description: 'Gym equipment, sportswear and outdoor gear' },
  { name: 'Beauty & Personal Care', description: 'Skincare, haircare, makeup and grooming' },
  { name: 'Toys & Games', description: 'Board games, puzzles, action figures and kids toys' },
  { name: 'Groceries', description: 'Pantry staples, snacks, beverages and organic foods' },
  { name: 'Automotive', description: 'Car accessories, tools and maintenance products' },
  { name: 'Baby & Kids', description: 'Baby gear, kids clothing and nursery essentials' },
  { name: 'Garden & Outdoors', description: 'Plants, garden tools, patio furniture and grills' },
  { name: 'Pet Supplies', description: 'Pet food, toys, grooming and accessories' },
];

const BRANDS = [
  'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Puma',
  'Boat', 'OnePlus', 'Philips', 'LG', 'Prestige', 'Hawkins',
  'Himalaya', 'Lakme', 'Levi\'s', 'US Polo', 'Funskool', 'Mattel',
  'Tata', 'Amul', 'Bosch', 'Pampers', 'Drools', 'Pedigree',
  'HP', 'Dell', 'JBL', 'Bose', 'Noise', 'Mi',
];

/* ──── reviewer templates ──── */
const REVIEWER_NAMES = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy',
  'Vikram Singh', 'Anita Desai', 'Karthik Nair', 'Meera Joshi',
  'Arjun Mehta', 'Divya Gupta', 'Suresh Iyer', 'Pooja Verma',
];

const REVIEW_TEMPLATES = {
  excellent: [
    { rating: 5, comment: 'Absolutely love this product! Exceeded all my expectations. Build quality is superb and works exactly as described.' },
    { rating: 5, comment: 'Best purchase I have made in a long time. Worth every rupee. Highly recommend to anyone looking for quality.' },
    { rating: 4, comment: 'Great product with minor areas for improvement. Overall very satisfied with the purchase and delivery was prompt.' },
  ],
  good: [
    { rating: 4, comment: 'Good value for money. Does the job well. Packaging was excellent and arrived in perfect condition.' },
    { rating: 4, comment: 'Solid product. Works as advertised. Would buy again. The quality is noticeably better than alternatives at this price.' },
    { rating: 3, comment: 'Decent product for the price. Not extraordinary but gets the work done. Delivery was on time.' },
  ],
  mixed: [
    { rating: 5, comment: 'Outstanding quality! My family loves it. Will definitely order more from this brand.' },
    { rating: 3, comment: 'Average quality. Expected better at this price point but it serves the purpose well enough.' },
    { rating: 4, comment: 'Really good product. Minor cosmetic issue but functionally perfect. Customer support was helpful.' },
  ],
};

/* ──────────────────────── PRODUCTS BY CATEGORY ──────────────────────── */

const buildProducts = (categories, brands) => {
  const c = (name) => categories[name]._id;
  const b = (name) => brands[name]._id;

  return [
    // ═══════════════ ELECTRONICS ═══════════════
    {
      name: 'Apple iPhone 15 (128GB, Blue)',
      description: 'The iPhone 15 features a stunning 6.1-inch Super Retina XDR display, A16 Bionic chip, 48MP main camera with 2x telephoto, Dynamic Island, USB-C connectivity, and all-day battery life. Water resistant with IP68 rating.',
      price: 79999,
      discountPrice: 72999,
      category: c('Electronics'), brand: b('Apple'), stock: 35,
      images: [unsplash('photo-1695048133142-1a20484d2569'), unsplash('photo-1592750475338-74b7b21085ab')],
      isFeatured: true,
      tags: ['smartphone', 'iphone', 'apple', 'mobile', '5g'],
      specifications: [
        { key: 'Display', value: '6.1" Super Retina XDR OLED' },
        { key: 'Processor', value: 'A16 Bionic' },
        { key: 'Storage', value: '128 GB' },
        { key: 'Camera', value: '48MP + 12MP Dual Rear' },
        { key: 'Battery', value: '3877 mAh' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Samsung Galaxy S24 Ultra (256GB)',
      description: 'Flagship smartphone with 6.8-inch QHD+ Dynamic AMOLED 2X display, Snapdragon 8 Gen 3, 200MP camera, built-in S Pen, Galaxy AI features, 5000mAh battery, and titanium frame construction.',
      price: 129999,
      discountPrice: 114999,
      category: c('Electronics'), brand: b('Samsung'), stock: 28,
      images: [unsplash('photo-1610945265064-0e34e5519bbf'), unsplash('photo-1678685888221-cda773a3dcdb')],
      isFeatured: true,
      tags: ['smartphone', 'samsung', 'galaxy', 'android', 'flagship'],
      specifications: [
        { key: 'Display', value: '6.8" QHD+ Dynamic AMOLED 2X' },
        { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { key: 'RAM', value: '12 GB' },
        { key: 'Storage', value: '256 GB' },
        { key: 'Camera', value: '200MP + 50MP + 12MP + 10MP' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'Industry-leading noise cancellation headphones with 30-hour battery life, crystal clear hands-free calling with 4 beamforming microphones, multipoint connection, and ultra-comfortable lightweight design.',
      price: 29990,
      discountPrice: 24990,
      category: c('Electronics'), brand: b('Sony'), stock: 55,
      images: [unsplash('photo-1618366712010-f4ae9c647dcb'), unsplash('photo-1546435770-a3e426bf472b')],
      isFeatured: true,
      tags: ['headphones', 'wireless', 'noise-cancelling', 'audio', 'bluetooth'],
      specifications: [
        { key: 'Driver', value: '30mm' },
        { key: 'Battery Life', value: '30 hours' },
        { key: 'Noise Cancellation', value: 'Adaptive ANC' },
        { key: 'Weight', value: '250g' },
        { key: 'Connectivity', value: 'Bluetooth 5.2, 3.5mm' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'OnePlus Nord CE 4 Lite 5G',
      description: 'Stunning 6.67-inch 120Hz AMOLED display, Snapdragon 695 processor, 5000mAh battery with 80W SUPERVOOC fast charging, 64MP AI camera, and OxygenOS for a smooth Android experience.',
      price: 19999,
      discountPrice: 17499,
      category: c('Electronics'), brand: b('OnePlus'), stock: 80,
      images: [unsplash('photo-1511707171634-5f897ff02aa9'), unsplash('photo-1598327106026-d9521da673b1')],
      tags: ['smartphone', 'oneplus', '5g', 'budget', 'android'],
      specifications: [
        { key: 'Display', value: '6.67" 120Hz AMOLED' },
        { key: 'Processor', value: 'Snapdragon 695' },
        { key: 'RAM', value: '8 GB' },
        { key: 'Battery', value: '5000 mAh, 80W Charging' },
        { key: 'Camera', value: '64MP + 2MP' },
      ],
      reviews: 'good',
    },
    {
      name: 'boAt Rockerz 450 Bluetooth Headphones',
      description: 'Wireless Bluetooth on-ear headphones with 40mm dynamic drivers, 300mAh battery providing up to 15 hours playtime, padded ear cushions, foldable design, and built-in microphone.',
      price: 1999,
      discountPrice: 1099,
      category: c('Electronics'), brand: b('Boat'), stock: 150,
      images: [unsplash('photo-1505740420928-5e560c06d30e')],
      tags: ['headphones', 'bluetooth', 'budget', 'wireless', 'audio'],
      specifications: [
        { key: 'Driver Size', value: '40mm' },
        { key: 'Battery Life', value: '15 hours' },
        { key: 'Bluetooth', value: '5.0' },
        { key: 'Weight', value: '185g' },
      ],
      reviews: 'mixed',
    },
    {
      name: 'HP Pavilion 15 Laptop (i5, 16GB, 512GB SSD)',
      description: 'Powerful everyday laptop with 12th Gen Intel Core i5-1235U, 15.6-inch FHD IPS anti-glare display, 16GB DDR4 RAM, 512GB PCIe SSD, Intel Iris Xe Graphics, backlit keyboard, and Windows 11.',
      price: 64990,
      discountPrice: 56990,
      category: c('Electronics'), brand: b('HP'), stock: 22,
      images: [unsplash('photo-1496181133206-80ce9b88a853'), unsplash('photo-1525547719571-a2d4ac8945e2')],
      isFeatured: true,
      tags: ['laptop', 'hp', 'intel', 'computer', 'windows'],
      specifications: [
        { key: 'Processor', value: 'Intel Core i5-1235U 12th Gen' },
        { key: 'RAM', value: '16 GB DDR4' },
        { key: 'Storage', value: '512 GB PCIe SSD' },
        { key: 'Display', value: '15.6" FHD IPS Anti-glare' },
        { key: 'OS', value: 'Windows 11 Home' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'JBL Flip 6 Portable Bluetooth Speaker',
      description: 'Portable waterproof speaker with powerful JBL Original Pro Sound, IP67 dust and water resistance, 12-hour playtime, PartyBoost for pairing multiple speakers, and bold signature style.',
      price: 12999,
      discountPrice: 9999,
      category: c('Electronics'), brand: b('JBL'), stock: 65,
      images: [unsplash('photo-1608043152269-423dbba4e7e1')],
      tags: ['speaker', 'bluetooth', 'portable', 'waterproof', 'audio'],
      specifications: [
        { key: 'Output Power', value: '30W' },
        { key: 'Battery Life', value: '12 hours' },
        { key: 'Waterproofing', value: 'IP67' },
        { key: 'Bluetooth', value: '5.1' },
        { key: 'Weight', value: '550g' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Noise ColorFit Pro 5 Smartwatch',
      description: '1.85-inch AMOLED display smartwatch with Bluetooth calling, 100+ sports modes, heart rate & SpO2 monitoring, sleep tracking, 7-day battery life, and IP68 water resistance.',
      price: 4999,
      discountPrice: 3499,
      category: c('Electronics'), brand: b('Noise'), stock: 95,
      images: [unsplash('photo-1579586337278-3befd40fd17a'), unsplash('photo-1508685096489-7aacd43bd3b1')],
      tags: ['smartwatch', 'fitness', 'wearable', 'bluetooth', 'health'],
      specifications: [
        { key: 'Display', value: '1.85" AMOLED' },
        { key: 'Battery Life', value: '7 days' },
        { key: 'Water Rating', value: 'IP68' },
        { key: 'Sensors', value: 'HR, SpO2, Accelerometer' },
      ],
      reviews: 'good',
    },

    // ═══════════════ FASHION ═══════════════
    {
      name: 'Levi\'s 511 Slim Fit Jeans (Blue)',
      description: 'Classic slim fit jeans crafted from premium stretch denim with a modern cut that sits below the waist with a slim leg. Features 5-pocket styling, zip fly closure, and Levi\'s signature leather patch.',
      price: 3299,
      discountPrice: 2499,
      category: c('Fashion'), brand: b('Levi\'s'), stock: 100,
      images: [unsplash('photo-1542272604-787c3835535d'), unsplash('photo-1541099649105-f69ad21f3246')],
      isFeatured: true,
      tags: ['jeans', 'men', 'denim', 'slim-fit', 'casual'],
      specifications: [
        { key: 'Fit', value: 'Slim Fit' },
        { key: 'Material', value: '98% Cotton, 2% Elastane' },
        { key: 'Closure', value: 'Zip Fly with Button' },
        { key: 'Rise', value: 'Mid Rise' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Nike Air Max 270 Running Shoes',
      description: 'Iconic lifestyle sneakers featuring Nike\'s tallest Air unit yet in the heel for unrivalled all-day comfort. Mesh upper provides breathability, foam midsole for lightweight cushioning.',
      price: 12995,
      discountPrice: 9995,
      category: c('Fashion'), brand: b('Nike'), stock: 45,
      images: [unsplash('photo-1542291026-7eec264c27ff'), unsplash('photo-1460353581641-37baddab0fa2')],
      isFeatured: true,
      tags: ['shoes', 'sneakers', 'running', 'nike', 'sportswear'],
      specifications: [
        { key: 'Sole', value: 'Rubber' },
        { key: 'Closure', value: 'Lace-Up' },
        { key: 'Upper Material', value: 'Mesh + Synthetic' },
        { key: 'Air Unit', value: '270° visible Air' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Adidas Ultraboost 22 Running Shoes',
      description: 'Premium performance running shoes with responsive BOOST midsole, Primeknit+ adaptive upper, Continental rubber outsole for extraordinary grip, and Torsion System for midfoot support.',
      price: 16999,
      discountPrice: 12999,
      category: c('Fashion'), brand: b('Adidas'), stock: 38,
      images: [unsplash('photo-1556906781-9a412961c28c'), unsplash('photo-1587563871167-1ee9c731aefb')],
      tags: ['shoes', 'running', 'adidas', 'sneakers', 'boost'],
      specifications: [
        { key: 'Sole', value: 'Continental Rubber' },
        { key: 'Midsole', value: 'BOOST' },
        { key: 'Upper', value: 'Primeknit+' },
        { key: 'Drop', value: '10mm' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'US Polo Assn. Classic Polo T-Shirt',
      description: 'Timeless regular fit polo t-shirt in premium 100% cotton piqué fabric. Features ribbed collar and cuffs, two-button placket, embroidered logo, and side vents for comfortable movement.',
      price: 1499,
      discountPrice: 899,
      category: c('Fashion'), brand: b('US Polo'), stock: 200,
      images: [unsplash('photo-1625910513413-5fc421e0fd9e'), unsplash('photo-1586363104862-3a5e2ab60d99')],
      tags: ['tshirt', 'polo', 'men', 'casual', 'cotton'],
      specifications: [
        { key: 'Fit', value: 'Regular Fit' },
        { key: 'Material', value: '100% Cotton Piqué' },
        { key: 'Collar', value: 'Ribbed Polo' },
        { key: 'Sleeve', value: 'Short Sleeve' },
      ],
      reviews: 'good',
    },
    {
      name: 'Puma RS-X Reinvention Sneakers',
      description: 'Bold retro-futuristic sneakers with RS cushioning technology, chunky sole design, mesh and leather upper, and vibrant color blocking. A streetwear statement piece for modern style.',
      price: 8999,
      discountPrice: 6499,
      category: c('Fashion'), brand: b('Puma'), stock: 55,
      images: [unsplash('photo-1608231387042-66d1773070a5')],
      tags: ['shoes', 'sneakers', 'puma', 'streetwear', 'retro'],
      specifications: [
        { key: 'Sole', value: 'Rubber' },
        { key: 'Cushioning', value: 'RS Technology' },
        { key: 'Upper', value: 'Mesh + Leather' },
      ],
      reviews: 'good',
    },
    {
      name: 'Levi\'s Women\'s Classic Denim Jacket',
      description: 'Iconic trucker jacket crafted from authentic denim with a tailored feminine fit. Features chest pockets, side hand pockets, button closure, and the signature Levi\'s red tab.',
      price: 4599,
      discountPrice: 3499,
      category: c('Fashion'), brand: b('Levi\'s'), stock: 40,
      images: [unsplash('photo-1551537482-f2075a1d41f2'), unsplash('photo-1594938298603-c8148c4dae35')],
      tags: ['jacket', 'denim', 'women', 'outerwear', 'casual'],
      specifications: [
        { key: 'Material', value: '100% Cotton Denim' },
        { key: 'Fit', value: 'Regular' },
        { key: 'Closure', value: 'Button Front' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Nike Dri-FIT Men\'s Training T-Shirt',
      description: 'Lightweight training tee with Nike Dri-FIT moisture-wicking technology that keeps you dry and comfortable. Mesh panels for added ventilation, ergonomic seams for natural movement.',
      price: 1995,
      discountPrice: 1495,
      category: c('Fashion'), brand: b('Nike'), stock: 120,
      images: [unsplash('photo-1581655353564-df123a1eb820')],
      tags: ['tshirt', 'men', 'sportswear', 'training', 'drifit'],
      specifications: [
        { key: 'Material', value: 'Dri-FIT Polyester' },
        { key: 'Fit', value: 'Standard' },
        { key: 'Technology', value: 'Moisture Wicking' },
      ],
      reviews: 'good',
    },

    // ═══════════════ HOME & KITCHEN ═══════════════
    {
      name: 'Prestige Omega Deluxe Non-Stick Cookware Set (3 pcs)',
      description: 'Premium non-stick cookware set with 5-layer granite coating for superior food release. Includes kadai, fry pan, and tawa. Heavy gauge aluminium body for even heat distribution. PFOA free.',
      price: 3499,
      discountPrice: 2699,
      category: c('Home & Kitchen'), brand: b('Prestige'), stock: 40,
      images: [unsplash('photo-1556909114-f6e7ad7d3136'), unsplash('photo-1584990347449-a6e0c4e53ef9')],
      isFeatured: true,
      tags: ['cookware', 'non-stick', 'kitchen', 'cooking', 'prestige'],
      specifications: [
        { key: 'Coating', value: '5-Layer Granite Non-Stick' },
        { key: 'Material', value: 'Heavy Gauge Aluminium' },
        { key: 'Pieces', value: '3 (Kadai, Fry Pan, Tawa)' },
        { key: 'Induction Compatible', value: 'Yes' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Hawkins Contura Pressure Cooker (5L)',
      description: 'India\'s trusted pressure cooker with a unique curved body for easier stirring and serving. Made from virgin aluminium, Hawkins Contura is designed for faster, fuel-efficient cooking.',
      price: 2999,
      discountPrice: 2599,
      category: c('Home & Kitchen'), brand: b('Hawkins'), stock: 55,
      images: [unsplash('photo-1585515320310-259814833e62')],
      tags: ['pressure-cooker', 'kitchen', 'cooking', 'hawkins'],
      specifications: [
        { key: 'Capacity', value: '5 Litres' },
        { key: 'Material', value: 'Virgin Aluminium' },
        { key: 'Induction Compatible', value: 'No (Gas & Electric)' },
        { key: 'Safety', value: 'ISI Certified' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Philips Daily Collection Mixer Grinder (750W)',
      description: '750 watt powerful mixer grinder with 4 jars for versatile grinding, blending and juicing. Turbo speed for tough ingredients, leak-proof lids, and advanced air ventilation for longer motor life.',
      price: 4495,
      discountPrice: 3695,
      category: c('Home & Kitchen'), brand: b('Philips'), stock: 30,
      images: [unsplash('photo-1570222094114-d054a817e56b')],
      tags: ['mixer', 'grinder', 'kitchen', 'appliance', 'philips'],
      specifications: [
        { key: 'Wattage', value: '750W' },
        { key: 'Jars', value: '4 (Wet, Dry, Chutney, Juicer)' },
        { key: 'Speed Settings', value: '3 + Pulse' },
        { key: 'Warranty', value: '2 Years' },
      ],
      reviews: 'good',
    },
    {
      name: 'LG 260L Frost-Free Double Door Refrigerator',
      description: 'Smart Inverter Compressor with 10 year warranty. Multi Air Flow for even cooling, Moist \'N\' Fresh vegetable crisper, Smart Connect for inverter/home UPS. 4-star energy rating.',
      price: 29990,
      discountPrice: 25990,
      category: c('Home & Kitchen'), brand: b('LG'), stock: 12,
      images: [unsplash('photo-1571175443880-49e1d25b2bc5')],
      isFeatured: true,
      tags: ['refrigerator', 'fridge', 'appliance', 'lg', 'kitchen'],
      specifications: [
        { key: 'Capacity', value: '260 Litres' },
        { key: 'Type', value: 'Frost-Free Double Door' },
        { key: 'Energy Rating', value: '4 Star' },
        { key: 'Compressor', value: 'Smart Inverter' },
        { key: 'Warranty', value: '1 Year + 10 Year Compressor' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Borosil Stainless Steel Lunch Box Set',
      description: 'Premium insulated stainless steel lunch box set with 3 containers and an insulated carry bag. Leak-proof lids, food-grade steel interior, keeps food hot for 4 hours. BPA-free.',
      price: 1299,
      discountPrice: 999,
      category: c('Home & Kitchen'), brand: b('Tata'), stock: 85,
      images: [unsplash('photo-1604908176997-125f25cc6f3d')],
      tags: ['lunch-box', 'steel', 'tiffin', 'kitchen', 'storage'],
      specifications: [
        { key: 'Material', value: 'Stainless Steel' },
        { key: 'Containers', value: '3' },
        { key: 'Insulation', value: '4 Hours' },
        { key: 'BPA Free', value: 'Yes' },
      ],
      reviews: 'good',
    },
    {
      name: 'Philips Air Fryer HD9200/90 (4.1L)',
      description: 'Rapid Air Technology for crispy frying with up to 90% less fat. 4.1L capacity, 1400W power, 7 presets including frying, baking, grilling, and roasting. Dishwasher-safe basket.',
      price: 7999,
      discountPrice: 6499,
      category: c('Home & Kitchen'), brand: b('Philips'), stock: 25,
      images: [unsplash('photo-1648565537498-cf8eb1a0c4d5')],
      tags: ['air-fryer', 'kitchen', 'appliance', 'philips', 'healthy'],
      specifications: [
        { key: 'Capacity', value: '4.1 Litres' },
        { key: 'Wattage', value: '1400W' },
        { key: 'Technology', value: 'Rapid Air' },
        { key: 'Presets', value: '7' },
      ],
      reviews: 'excellent',
    },

    // ═══════════════ BOOKS ═══════════════
    {
      name: 'Atomic Habits by James Clear',
      description: 'The #1 New York Times bestseller. Tiny Changes, Remarkable Results. Learn how to build good habits, break bad ones, and master the tiny behaviors that lead to remarkable results in life and work.',
      price: 699,
      discountPrice: 450,
      category: c('Books'), brand: b('Tata'), stock: 300,
      images: [unsplash('photo-1544947950-fa07a98d237f')],
      tags: ['self-help', 'habits', 'bestseller', 'non-fiction', 'motivation'],
      specifications: [
        { key: 'Author', value: 'James Clear' },
        { key: 'Pages', value: '320' },
        { key: 'Language', value: 'English' },
        { key: 'Format', value: 'Paperback' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'The Psychology of Money by Morgan Housel',
      description: 'Timeless lessons on wealth, greed, and happiness. Through 19 short stories, Morgan Housel explores the strange ways people think about money and teaches you how to make better sense of it.',
      price: 399,
      discountPrice: 299,
      category: c('Books'), brand: b('Tata'), stock: 250,
      images: [unsplash('photo-1512820790803-83ca734da794')],
      tags: ['finance', 'money', 'investing', 'bestseller', 'non-fiction'],
      specifications: [
        { key: 'Author', value: 'Morgan Housel' },
        { key: 'Pages', value: '256' },
        { key: 'Language', value: 'English' },
        { key: 'Format', value: 'Paperback' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Rich Dad Poor Dad by Robert Kiyosaki',
      description: 'The international bestseller that has changed millions of lives. Robert Kiyosaki shares what the rich teach their kids about money that the poor and middle class do not.',
      price: 399,
      discountPrice: 275,
      category: c('Books'), brand: b('Tata'), stock: 280,
      images: [unsplash('photo-1543002588-bfa74002ed7e')],
      tags: ['finance', 'investing', 'bestseller', 'business', 'non-fiction'],
      specifications: [
        { key: 'Author', value: 'Robert T. Kiyosaki' },
        { key: 'Pages', value: '336' },
        { key: 'Language', value: 'English' },
        { key: 'Format', value: 'Paperback' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Ikigai: The Japanese Secret to a Long and Happy Life',
      description: 'International bestseller that reveals the secrets of the centenarians of Okinawa and the Japanese philosophy of ikigai — finding your reason for being and living a long, purposeful life.',
      price: 350,
      discountPrice: 225,
      category: c('Books'), brand: b('Tata'), stock: 180,
      images: [unsplash('photo-1524578271613-d550eacf6090')],
      tags: ['self-help', 'japanese', 'philosophy', 'happiness', 'bestseller'],
      specifications: [
        { key: 'Author', value: 'Héctor García & Francesc Miralles' },
        { key: 'Pages', value: '208' },
        { key: 'Language', value: 'English' },
        { key: 'Format', value: 'Paperback' },
      ],
      reviews: 'good',
    },
    {
      name: 'The Alchemist by Paulo Coelho',
      description: 'A magical fable about following your dream. The Alchemist has inspired millions of readers with its timeless tale of Santiago, an Andalusian shepherd boy who yearns to travel.',
      price: 350,
      discountPrice: 199,
      category: c('Books'), brand: b('Tata'), stock: 320,
      images: [unsplash('photo-1495446815901-a7297e633e8d')],
      tags: ['fiction', 'classic', 'bestseller', 'novel', 'philosophy'],
      specifications: [
        { key: 'Author', value: 'Paulo Coelho' },
        { key: 'Pages', value: '163' },
        { key: 'Language', value: 'English' },
        { key: 'Format', value: 'Paperback' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Sapiens: A Brief History of Humankind',
      description: 'Yuval Noah Harari\'s groundbreaking narrative of humanity\'s creation and evolution that explores the ways in which biology and history have defined us.',
      price: 599,
      discountPrice: 399,
      category: c('Books'), brand: b('Tata'), stock: 150,
      images: [unsplash('photo-1589998059171-988d887df646')],
      tags: ['history', 'science', 'non-fiction', 'bestseller', 'anthropology'],
      specifications: [
        { key: 'Author', value: 'Yuval Noah Harari' },
        { key: 'Pages', value: '464' },
        { key: 'Language', value: 'English' },
        { key: 'Format', value: 'Paperback' },
      ],
      reviews: 'excellent',
    },

    // ═══════════════ SPORTS & FITNESS ═══════════════
    {
      name: 'Nike Dri-FIT Running Shorts (Men)',
      description: 'Lightweight running shorts with Dri-FIT moisture-wicking technology, built-in brief liner, elastic waistband with internal drawcord, zippered back pocket, and reflective swoosh for low-light visibility.',
      price: 2495,
      discountPrice: 1795,
      category: c('Sports & Fitness'), brand: b('Nike'), stock: 75,
      images: [unsplash('photo-1515886657613-9f3515b0c78f')],
      tags: ['shorts', 'running', 'men', 'sportswear', 'drifit'],
      specifications: [
        { key: 'Material', value: '100% Recycled Polyester' },
        { key: 'Inseam', value: '7 inches' },
        { key: 'Technology', value: 'Dri-FIT' },
        { key: 'Liner', value: 'Built-in Brief' },
      ],
      reviews: 'good',
    },
    {
      name: 'Boldfit Adjustable Dumbbell Set (20 kg)',
      description: 'Space-saving adjustable dumbbells with quick-change weight system. Includes 4 weight plates (2.5kg each), 2 dumbbell rods, and 4 spinlock collars. Chrome-plated for durability.',
      price: 2499,
      discountPrice: 1899,
      category: c('Sports & Fitness'), brand: b('Noise'), stock: 40,
      images: [unsplash('photo-1534438327276-14e5300c3a48'), unsplash('photo-1583454110551-21f2fa2afe61')],
      isFeatured: true,
      tags: ['dumbbells', 'gym', 'strength', 'home-workout', 'fitness'],
      specifications: [
        { key: 'Total Weight', value: '20 kg' },
        { key: 'Material', value: 'Chrome Plated Steel' },
        { key: 'Plates', value: '4 × 2.5 kg' },
        { key: 'Grip', value: 'Textured Non-Slip' },
      ],
      reviews: 'good',
    },
    {
      name: 'Yoga Mat Premium 6mm (Anti-Skid)',
      description: 'High-density EVA foam yoga mat with anti-skid texture on both sides. Lightweight, tear-resistant, and provides excellent cushioning for joints. Comes with carrying strap.',
      price: 999,
      discountPrice: 649,
      category: c('Sports & Fitness'), brand: b('Adidas'), stock: 110,
      images: [unsplash('photo-1601925260368-ae2f83cf8b7f')],
      tags: ['yoga', 'mat', 'fitness', 'exercise', 'home-workout'],
      specifications: [
        { key: 'Thickness', value: '6mm' },
        { key: 'Material', value: 'High-Density EVA Foam' },
        { key: 'Size', value: '183 × 61 cm' },
        { key: 'Anti-Skid', value: 'Both Sides' },
      ],
      reviews: 'mixed',
    },
    {
      name: 'Adidas Striker II Team Backpack',
      description: 'Spacious sports backpack with padded laptop sleeve, multiple compartments, adjustable padded shoulder straps, ventilated back panel, and water-resistant base. Perfect for gym or travel.',
      price: 3999,
      discountPrice: 2999,
      category: c('Sports & Fitness'), brand: b('Adidas'), stock: 50,
      images: [unsplash('photo-1553062407-98eeb64c6a62')],
      tags: ['backpack', 'gym', 'sports', 'bag', 'travel'],
      specifications: [
        { key: 'Capacity', value: '30L' },
        { key: 'Material', value: 'Polyester' },
        { key: 'Laptop Sleeve', value: 'Up to 15.6"' },
        { key: 'Water Resistant', value: 'Base' },
      ],
      reviews: 'good',
    },
    {
      name: 'Puma Running Armband Phone Holder',
      description: 'Secure running armband with adjustable elastic strap, transparent touchscreen window, reflective details for visibility, and earphone cord management. Fits phones up to 6.5 inches.',
      price: 799,
      discountPrice: 549,
      category: c('Sports & Fitness'), brand: b('Puma'), stock: 90,
      images: [unsplash('photo-1476480862126-209bfaa8edc8')],
      tags: ['armband', 'running', 'phone', 'accessory', 'sports'],
      specifications: [
        { key: 'Compatibility', value: 'Up to 6.5" phones' },
        { key: 'Material', value: 'Neoprene + Lycra' },
        { key: 'Reflective', value: 'Yes' },
      ],
      reviews: 'mixed',
    },
    {
      name: 'Resistance Bands Set (5 Levels)',
      description: 'Complete set of 5 resistance bands with varying levels from extra light to extra heavy. Includes door anchor, ankle straps, and carrying bag. Natural latex, snap-resistant design.',
      price: 699,
      discountPrice: 449,
      category: c('Sports & Fitness'), brand: b('Noise'), stock: 130,
      images: [unsplash('photo-1598289431512-b97b0917affc')],
      tags: ['resistance-bands', 'fitness', 'home-workout', 'exercise', 'stretching'],
      specifications: [
        { key: 'Levels', value: '5 (Extra Light to Extra Heavy)' },
        { key: 'Material', value: 'Natural Latex' },
        { key: 'Includes', value: 'Door Anchor, Ankle Straps, Bag' },
      ],
      reviews: 'good',
    },

    // ═══════════════ BEAUTY & PERSONAL CARE ═══════════════
    {
      name: 'Himalaya Neem Face Wash (200ml)',
      description: 'Purifying neem face wash that cleanses impurities, removes excess oil, and helps prevent pimples. Soap-free formula with neem and turmeric for clear, problem-free skin.',
      price: 230,
      discountPrice: 195,
      category: c('Beauty & Personal Care'), brand: b('Himalaya'), stock: 200,
      images: [unsplash('photo-1556228578-0d85b1a4d571')],
      tags: ['facewash', 'neem', 'skincare', 'acne', 'ayurvedic'],
      specifications: [
        { key: 'Volume', value: '200 ml' },
        { key: 'Skin Type', value: 'Oily & Acne Prone' },
        { key: 'Key Ingredients', value: 'Neem, Turmeric' },
        { key: 'Soap Free', value: 'Yes' },
      ],
      reviews: 'good',
    },
    {
      name: 'Lakme 9 to 5 Primer + Matte Lipstick',
      description: 'Long-lasting matte lipstick with built-in primer for smooth, even coverage. Enriched with vitamin E, provides intense color payoff that stays comfortable for up to 12 hours.',
      price: 650,
      discountPrice: 520,
      category: c('Beauty & Personal Care'), brand: b('Lakme'), stock: 90,
      images: [unsplash('photo-1586495777744-4413f21062fa')],
      tags: ['lipstick', 'makeup', 'matte', 'lakme', 'cosmetics'],
      specifications: [
        { key: 'Finish', value: 'Matte' },
        { key: 'Duration', value: 'Up to 12 Hours' },
        { key: 'Enriched With', value: 'Vitamin E' },
        { key: 'Weight', value: '3.6g' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Himalaya Anti-Hair Fall Shampoo (400ml)',
      description: 'Clinically tested formula that reduces hair fall due to breakage with the goodness of Bhringaraja and Palasha. Strengthens hair from root to tip and promotes healthy hair growth.',
      price: 340,
      discountPrice: 289,
      category: c('Beauty & Personal Care'), brand: b('Himalaya'), stock: 160,
      images: [unsplash('photo-1535585209827-a15fcdbc4c2d')],
      tags: ['shampoo', 'haircare', 'anti-hairfall', 'himalaya', 'herbal'],
      specifications: [
        { key: 'Volume', value: '400 ml' },
        { key: 'Hair Type', value: 'All Hair Types' },
        { key: 'Key Ingredients', value: 'Bhringaraja, Palasha' },
        { key: 'Paraben Free', value: 'Yes' },
      ],
      reviews: 'good',
    },
    {
      name: 'Lakme Absolute Skin Dew Serum Foundation',
      description: 'Lightweight serum-infused foundation that gives a natural, dewy finish. Blends seamlessly for buildable coverage with SPF 20 sun protection. Non-comedogenic and dermatologically tested.',
      price: 899,
      discountPrice: 749,
      category: c('Beauty & Personal Care'), brand: b('Lakme'), stock: 70,
      images: [unsplash('photo-1596462502278-27bfdc403348')],
      tags: ['foundation', 'makeup', 'skincare', 'lakme', 'cosmetics'],
      specifications: [
        { key: 'Coverage', value: 'Light to Medium, Buildable' },
        { key: 'Finish', value: 'Dewy' },
        { key: 'SPF', value: '20' },
        { key: 'Volume', value: '25 ml' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Philips BT3211/15 Beard Trimmer',
      description: 'Precision beard trimmer with DuraPower technology for 4x longer battery life. 20 length settings (0.5mm to 10mm), stainless steel blades with rounded tips, 60 min runtime, USB charging.',
      price: 1695,
      discountPrice: 1295,
      category: c('Beauty & Personal Care'), brand: b('Philips'), stock: 60,
      images: [unsplash('photo-1621607512214-68297480165e')],
      tags: ['trimmer', 'beard', 'grooming', 'men', 'philips'],
      specifications: [
        { key: 'Length Settings', value: '20 (0.5mm - 10mm)' },
        { key: 'Runtime', value: '60 minutes' },
        { key: 'Blade', value: 'Stainless Steel' },
        { key: 'Charging', value: 'USB Type-C' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Vitamin C Face Serum with Hyaluronic Acid (30ml)',
      description: 'Brightening face serum with 20% Vitamin C, Hyaluronic Acid, and Vitamin E. Reduces dark spots, evens skin tone, boosts collagen, and provides deep hydration for glowing skin.',
      price: 599,
      discountPrice: 399,
      category: c('Beauty & Personal Care'), brand: b('Himalaya'), stock: 100,
      images: [unsplash('photo-1620916566398-39f1143ab7be')],
      tags: ['serum', 'vitamin-c', 'skincare', 'brightening', 'face'],
      specifications: [
        { key: 'Volume', value: '30 ml' },
        { key: 'Key Ingredients', value: '20% Vitamin C, Hyaluronic Acid, Vitamin E' },
        { key: 'Skin Type', value: 'All Skin Types' },
        { key: 'Paraben Free', value: 'Yes' },
      ],
      reviews: 'mixed',
    },

    // ═══════════════ TOYS & GAMES ═══════════════
    {
      name: 'LEGO Classic Creative Bricks (484 Pieces)',
      description: 'Spark creative building with this collection of classic LEGO bricks in 29 colors. Includes windows, doors, and a green baseplate. Endless building possibilities for ages 4+.',
      price: 2499,
      discountPrice: 1999,
      category: c('Toys & Games'), brand: b('Funskool'), stock: 45,
      images: [unsplash('photo-1587654780291-39c9404d7dd0'), unsplash('photo-1560961911-ba7ef651a56c')],
      isFeatured: true,
      tags: ['lego', 'building', 'creative', 'kids', 'educational'],
      specifications: [
        { key: 'Pieces', value: '484' },
        { key: 'Age', value: '4+' },
        { key: 'Colors', value: '29' },
        { key: 'Includes', value: 'Windows, Doors, Baseplate' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Funskool Monopoly Classic Board Game',
      description: 'The classic property trading board game that has been entertaining families for generations. Buy, sell, and trade properties, build houses and hotels, and bankrupt your opponents.',
      price: 899,
      discountPrice: 699,
      category: c('Toys & Games'), brand: b('Funskool'), stock: 80,
      images: [unsplash('photo-1632501641765-e568d28b0015')],
      tags: ['board-game', 'monopoly', 'family', 'strategy', 'classic'],
      specifications: [
        { key: 'Players', value: '2-8' },
        { key: 'Age', value: '8+' },
        { key: 'Duration', value: '60-180 minutes' },
        { key: 'Type', value: 'Board Game' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Barbie Dreamhouse (3-Story, 10 Rooms)',
      description: 'The ultimate Barbie Dreamhouse with 3 stories, 10 rooms, a working elevator, pool with slide, 75+ accessories, and customizable features. Lights, sounds, and endless imaginative play.',
      price: 7999,
      discountPrice: 6499,
      category: c('Toys & Games'), brand: b('Mattel'), stock: 15,
      images: [unsplash('photo-1558618666-fcd25c85f82e')],
      tags: ['barbie', 'dollhouse', 'girls', 'pretend-play', 'mattel'],
      specifications: [
        { key: 'Stories', value: '3' },
        { key: 'Rooms', value: '10' },
        { key: 'Accessories', value: '75+' },
        { key: 'Age', value: '3+' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Hot Wheels 20-Car Gift Pack',
      description: 'Exciting 20-car gift pack featuring an assortment of 1:64 scale die-cast Hot Wheels vehicles. Includes a mix of classic and modern car designs. Perfect starter set for collectors.',
      price: 1999,
      discountPrice: 1499,
      category: c('Toys & Games'), brand: b('Mattel'), stock: 55,
      images: [unsplash('photo-1594787318286-3d835c1d207f')],
      tags: ['hot-wheels', 'cars', 'die-cast', 'boys', 'mattel'],
      specifications: [
        { key: 'Cars', value: '20' },
        { key: 'Scale', value: '1:64' },
        { key: 'Material', value: 'Die-Cast Metal + Plastic' },
        { key: 'Age', value: '3+' },
      ],
      reviews: 'good',
    },
    {
      name: '1000-Piece Jigsaw Puzzle - World Map',
      description: 'Beautiful 1000-piece jigsaw puzzle featuring a detailed vintage world map. Premium quality pieces with linen finish for reduced glare. Completed size: 70 × 50 cm.',
      price: 799,
      discountPrice: 599,
      category: c('Toys & Games'), brand: b('Funskool'), stock: 70,
      images: [unsplash('photo-1606503153255-59d8b2b4aaba')],
      tags: ['puzzle', 'jigsaw', 'family', 'brain', 'map'],
      specifications: [
        { key: 'Pieces', value: '1000' },
        { key: 'Size', value: '70 × 50 cm' },
        { key: 'Age', value: '12+' },
        { key: 'Finish', value: 'Linen (Anti-Glare)' },
      ],
      reviews: 'good',
    },

    // ═══════════════ GROCERIES ═══════════════
    {
      name: 'Tata Gold Tea (500g)',
      description: 'Premium blend of the finest Assam tea leaves, carefully selected for rich color, strong aroma, and invigorating taste. 15% extra long leaf tea for a superior chai experience.',
      price: 299,
      discountPrice: 265,
      category: c('Groceries'), brand: b('Tata'), stock: 500,
      images: [unsplash('photo-1556679343-c7306c1976bc')],
      tags: ['tea', 'beverages', 'assam', 'tata', 'daily-essentials'],
      specifications: [
        { key: 'Weight', value: '500g' },
        { key: 'Type', value: 'CTC + Long Leaf Blend' },
        { key: 'Origin', value: 'Assam' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Amul Butter (500g, Pasteurized)',
      description: 'India\'s favorite butter made from fresh cream. Rich, creamy taste perfect for parathas, toast, cooking, and baking. Pasteurized for safety and freshness.',
      price: 275,
      category: c('Groceries'), brand: b('Amul'), stock: 400,
      images: [unsplash('photo-1589985270826-4b7bb135bc9d')],
      tags: ['butter', 'dairy', 'amul', 'breakfast', 'cooking'],
      specifications: [
        { key: 'Weight', value: '500g' },
        { key: 'Type', value: 'Pasteurized Salted Butter' },
        { key: 'Fat Content', value: '80%' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Tata Sampann Unpolished Toor Dal (1kg)',
      description: 'Unpolished toor dal that retains natural fibre and nutrients. Sourced from the best farms, naturally processed without artificial polishing. Cooks faster and tastes better.',
      price: 189,
      discountPrice: 169,
      category: c('Groceries'), brand: b('Tata'), stock: 350,
      images: [unsplash('photo-1596040033229-a9821ebd058d')],
      tags: ['dal', 'pulses', 'organic', 'healthy', 'daily-essentials'],
      specifications: [
        { key: 'Weight', value: '1 kg' },
        { key: 'Type', value: 'Unpolished Toor Dal' },
        { key: 'Preservatives', value: 'None' },
      ],
      reviews: 'good',
    },
    {
      name: 'Amul Dark Chocolate (150g, 55% Cocoa)',
      description: 'Premium dark chocolate made with 55% cocoa. Rich, intense flavor with smooth texture. Perfect for snacking or baking. Made with real cocoa butter.',
      price: 150,
      discountPrice: 125,
      category: c('Groceries'), brand: b('Amul'), stock: 250,
      images: [unsplash('photo-1549007994-cb92caebd54b')],
      tags: ['chocolate', 'dark-chocolate', 'snack', 'amul', 'confectionery'],
      specifications: [
        { key: 'Weight', value: '150g' },
        { key: 'Cocoa', value: '55%' },
        { key: 'Vegetarian', value: 'Yes' },
      ],
      reviews: 'good',
    },
    {
      name: 'Organic Honey (500g, Raw & Unprocessed)',
      description: 'Pure organic honey sourced directly from beekeepers. Raw, unprocessed, and unfiltered to retain natural enzymes and antioxidants. No added sugar or artificial flavors.',
      price: 499,
      discountPrice: 399,
      category: c('Groceries'), brand: b('Himalaya'), stock: 120,
      images: [unsplash('photo-1587049352846-4a222e784d38')],
      tags: ['honey', 'organic', 'healthy', 'natural', 'superfood'],
      specifications: [
        { key: 'Weight', value: '500g' },
        { key: 'Type', value: 'Raw & Unprocessed' },
        { key: 'Organic Certified', value: 'Yes' },
        { key: 'Added Sugar', value: 'None' },
      ],
      reviews: 'excellent',
    },

    // ═══════════════ AUTOMOTIVE ═══════════════
    {
      name: 'Bosch Car Vacuum Cleaner (12V, Portable)',
      description: 'Powerful 12V portable car vacuum cleaner with HEPA filter, wet and dry cleaning capability. Includes crevice tool, brush nozzle, and flexible hose. Plugs into car 12V socket.',
      price: 3499,
      discountPrice: 2799,
      category: c('Automotive'), brand: b('Bosch'), stock: 35,
      images: [unsplash('photo-1558618666-fcd25c85f82e')],
      tags: ['car', 'vacuum', 'cleaner', 'automotive', 'bosch'],
      specifications: [
        { key: 'Power', value: '12V DC' },
        { key: 'Suction', value: '4500 Pa' },
        { key: 'Filter', value: 'HEPA' },
        { key: 'Cable Length', value: '4.5m' },
      ],
      reviews: 'good',
    },
    {
      name: 'Car Phone Mount (Dashboard & Vent)',
      description: 'Universal car phone mount with strong suction cup for dashboard and adjustable vent clip. 360° rotation, one-hand operation, compatible with all smartphones up to 7 inches.',
      price: 599,
      discountPrice: 399,
      category: c('Automotive'), brand: b('Mi'), stock: 150,
      images: [unsplash('photo-1558618666-fcd25c85f82e')],
      tags: ['phone-mount', 'car-accessory', 'holder', 'automotive'],
      specifications: [
        { key: 'Mount Type', value: 'Dashboard + Vent Clip' },
        { key: 'Rotation', value: '360°' },
        { key: 'Compatibility', value: 'Up to 7" phones' },
      ],
      reviews: 'mixed',
    },
    {
      name: 'Bosch Aerotwin Wiper Blades (Pair)',
      description: 'Premium flat wiper blades with patented Power Protection Plus rubber for smooth, streak-free wiping. Aerodynamic design reduces wind lift. Universal fit for most cars.',
      price: 1299,
      discountPrice: 999,
      category: c('Automotive'), brand: b('Bosch'), stock: 70,
      images: [unsplash('photo-1489824904134-891ab64532f1')],
      tags: ['wiper', 'blades', 'car-parts', 'bosch', 'rain'],
      specifications: [
        { key: 'Type', value: 'Flat / Aerotwin' },
        { key: 'Material', value: 'Power Protection Plus Rubber' },
        { key: 'Fit', value: 'Universal' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Car Dash Camera 1080p Full HD',
      description: 'Full HD 1080p dash camera with 170° wide-angle lens, night vision, G-sensor for automatic incident detection, loop recording, parking monitor, and 32GB micro SD card included.',
      price: 3999,
      discountPrice: 2999,
      category: c('Automotive'), brand: b('Mi'), stock: 45,
      images: [unsplash('photo-1502877338535-766e1452684a')],
      tags: ['dashcam', 'camera', 'car-security', 'automotive', '1080p'],
      specifications: [
        { key: 'Resolution', value: '1080p Full HD' },
        { key: 'Angle', value: '170° Wide Angle' },
        { key: 'Night Vision', value: 'Yes' },
        { key: 'Storage', value: '32GB SD Card Included' },
      ],
      reviews: 'good',
    },

    // ═══════════════ BABY & KIDS ═══════════════
    {
      name: 'Pampers Premium Care Diapers (M, 76 Count)',
      description: 'Ultra-soft premium diapers with 360° breathable cottony cover. 5 layers of absorption, wetness indicator, and up to 12 hours dryness. Dermatologically tested, hypoallergenic.',
      price: 1399,
      discountPrice: 1149,
      category: c('Baby & Kids'), brand: b('Pampers'), stock: 100,
      images: [unsplash('photo-1584839404091-35e89080a381')],
      isFeatured: true,
      tags: ['diapers', 'baby', 'pampers', 'premium', 'absorbent'],
      specifications: [
        { key: 'Size', value: 'Medium (6-11 kg)' },
        { key: 'Count', value: '76' },
        { key: 'Absorption', value: '5 Layers' },
        { key: 'Dryness', value: 'Up to 12 Hours' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Baby Stroller (Foldable, Lightweight)',
      description: 'Compact foldable stroller with 5-point safety harness, adjustable canopy with UV protection, one-hand fold mechanism, front swivel wheels with lock, and spacious storage basket.',
      price: 6999,
      discountPrice: 5499,
      category: c('Baby & Kids'), brand: b('LG'), stock: 20,
      images: [unsplash('photo-1586022773068-ea1e4d26b7d1')],
      tags: ['stroller', 'baby', 'pram', 'foldable', 'travel'],
      specifications: [
        { key: 'Weight Capacity', value: 'Up to 15 kg' },
        { key: 'Fold Type', value: 'One-Hand' },
        { key: 'Safety', value: '5-Point Harness' },
        { key: 'Stroller Weight', value: '6.5 kg' },
      ],
      reviews: 'good',
    },
    {
      name: 'Kids Educational Tablet (7-inch, WiFi)',
      description: 'Child-safe educational tablet with 7-inch HD display, parental controls, pre-loaded educational apps, dual camera, kid-proof silicone case, and 16GB storage. Ages 3-10.',
      price: 5999,
      discountPrice: 4499,
      category: c('Baby & Kids'), brand: b('Samsung'), stock: 30,
      images: [unsplash('photo-1544476915-ed1370594142')],
      tags: ['tablet', 'educational', 'kids', 'learning', 'technology'],
      specifications: [
        { key: 'Display', value: '7" HD IPS' },
        { key: 'Storage', value: '16 GB (Expandable)' },
        { key: 'Age', value: '3-10 years' },
        { key: 'Case', value: 'Kid-Proof Silicone' },
      ],
      reviews: 'mixed',
    },
    {
      name: 'Baby Monitor Camera (WiFi, Night Vision)',
      description: 'Smart baby monitor with 1080p HD camera, two-way audio, night vision, temperature alert, cry detection, and lullabies. Works with mobile app for remote monitoring anywhere.',
      price: 3499,
      discountPrice: 2799,
      category: c('Baby & Kids'), brand: b('Mi'), stock: 40,
      images: [unsplash('photo-1555252333-9f8e92e65df9')],
      tags: ['baby-monitor', 'camera', 'safety', 'smart-home', 'baby'],
      specifications: [
        { key: 'Resolution', value: '1080p HD' },
        { key: 'Night Vision', value: 'Infrared' },
        { key: 'Two-Way Audio', value: 'Yes' },
        { key: 'App', value: 'iOS & Android' },
      ],
      reviews: 'excellent',
    },

    // ═══════════════ GARDEN & OUTDOORS ═══════════════
    {
      name: 'Garden Tool Set (10 Pieces, Heavy Duty)',
      description: 'Complete garden tool set with trowel, transplanter, weeder, cultivator, pruner, and gloves. Ergonomic non-slip handles, rust-resistant carbon steel heads, and carrying tote bag.',
      price: 1499,
      discountPrice: 1099,
      category: c('Garden & Outdoors'), brand: b('Bosch'), stock: 40,
      images: [unsplash('photo-1416879595882-3373a0480b5b')],
      tags: ['garden-tools', 'gardening', 'outdoor', 'planting', 'set'],
      specifications: [
        { key: 'Pieces', value: '10' },
        { key: 'Material', value: 'Carbon Steel + Rubber Grip' },
        { key: 'Rust Resistant', value: 'Yes' },
        { key: 'Bag', value: 'Canvas Tote Included' },
      ],
      reviews: 'good',
    },
    {
      name: 'Solar LED Garden Lights (Pack of 6)',
      description: 'Auto on/off solar-powered garden path lights with warm white LEDs. Stainless steel body, waterproof IP65 rating, 8-hour runtime on full charge. No wiring needed.',
      price: 999,
      discountPrice: 699,
      category: c('Garden & Outdoors'), brand: b('Philips'), stock: 75,
      images: [unsplash('photo-1558171813-4c088753af8f')],
      tags: ['solar', 'garden-lights', 'outdoor', 'led', 'decoration'],
      specifications: [
        { key: 'Power', value: 'Solar' },
        { key: 'LED Type', value: 'Warm White' },
        { key: 'Runtime', value: '8 Hours' },
        { key: 'Waterproof', value: 'IP65' },
      ],
      reviews: 'mixed',
    },
    {
      name: 'Portable Camping Tent (3-Person)',
      description: 'Easy pop-up 3-person camping tent with waterproof polyester flysheet, mesh windows for ventilation, UV protection, and carrying bag. Sets up in under 2 minutes.',
      price: 3999,
      discountPrice: 2999,
      category: c('Garden & Outdoors'), brand: b('Adidas'), stock: 25,
      images: [unsplash('photo-1504280390367-361c6d9f38f4')],
      tags: ['tent', 'camping', 'outdoor', 'hiking', 'travel'],
      specifications: [
        { key: 'Capacity', value: '3 Person' },
        { key: 'Material', value: 'Waterproof Polyester' },
        { key: 'Setup', value: 'Pop-Up (2 minutes)' },
        { key: 'UV Protection', value: 'UPF 50+' },
      ],
      reviews: 'good',
    },
    {
      name: 'Hanging Planter Set (Macrame, 3 Pack)',
      description: 'Handwoven macrame hanging planters made from natural cotton rope. Three different sizes for creating a beautiful green corner. Holds pots up to 7 inches diameter.',
      price: 699,
      discountPrice: 499,
      category: c('Garden & Outdoors'), brand: b('Tata'), stock: 60,
      images: [unsplash('photo-1485955900006-10f4d324d411')],
      tags: ['planter', 'macrame', 'decor', 'indoor', 'hanging'],
      specifications: [
        { key: 'Material', value: 'Natural Cotton Rope' },
        { key: 'Pack', value: '3 (S, M, L)' },
        { key: 'Max Pot Size', value: '7 inches' },
      ],
      reviews: 'good',
    },

    // ═══════════════ PET SUPPLIES ═══════════════
    {
      name: 'Drools Chicken & Egg Adult Dog Food (12kg)',
      description: 'Complete and balanced nutrition for adult dogs with real chicken as the #1 ingredient. Rich in protein, omega fatty acids for healthy coat, and essential vitamins and minerals.',
      price: 2199,
      discountPrice: 1799,
      category: c('Pet Supplies'), brand: b('Drools'), stock: 60,
      images: [unsplash('photo-1568640347023-a616a30bc3bd')],
      isFeatured: true,
      tags: ['dog-food', 'pet', 'chicken', 'adult-dog', 'nutrition'],
      specifications: [
        { key: 'Weight', value: '12 kg' },
        { key: 'Protein', value: '26%' },
        { key: 'Primary Ingredient', value: 'Real Chicken' },
        { key: 'Life Stage', value: 'Adult (1+ Years)' },
      ],
      reviews: 'excellent',
    },
    {
      name: 'Pedigree DentaStix Dog Treats (28 Sticks)',
      description: 'Scientifically proven daily dental chews that reduce tartar build-up by up to 80%. X-shaped design cleans down to the gum line. Low fat and no artificial flavors.',
      price: 649,
      discountPrice: 549,
      category: c('Pet Supplies'), brand: b('Pedigree'), stock: 90,
      images: [unsplash('photo-1601758228041-f3b2795255f1')],
      tags: ['dog-treats', 'dental', 'pet', 'pedigree', 'chews'],
      specifications: [
        { key: 'Count', value: '28 Sticks' },
        { key: 'Size', value: 'Medium Dogs (10-25 kg)' },
        { key: 'Tartar Reduction', value: 'Up to 80%' },
      ],
      reviews: 'good',
    },
    {
      name: 'Interactive Cat Toy (Automatic Rotating Feather)',
      description: 'Battery-operated interactive cat toy with automatic rotating feather attachment. Multiple speed settings, low noise motor, detachable feathers, and non-slip base to keep cats engaged.',
      price: 799,
      discountPrice: 549,
      category: c('Pet Supplies'), brand: b('Funskool'), stock: 80,
      images: [unsplash('photo-1573497620053-ea5300f94f21')],
      tags: ['cat-toy', 'pet', 'interactive', 'automatic', 'feather'],
      specifications: [
        { key: 'Power', value: '3 × AA Batteries' },
        { key: 'Speeds', value: '3 Settings' },
        { key: 'Feathers', value: '4 Replaceable' },
      ],
      reviews: 'mixed',
    },
    {
      name: 'Drools Creamy Treats Cat Lickable (15g × 24)',
      description: 'Irresistible creamy lickable treats for cats. Made with real tuna and chicken, high moisture content for hydration. Perfect for bonding, feeding from hand, or as food topper.',
      price: 449,
      discountPrice: 349,
      category: c('Pet Supplies'), brand: b('Drools'), stock: 110,
      images: [unsplash('photo-1574158622682-e40e69881006')],
      tags: ['cat-treats', 'lickable', 'pet', 'tuna', 'drools'],
      specifications: [
        { key: 'Count', value: '24 Sachets × 15g' },
        { key: 'Flavors', value: 'Tuna & Chicken' },
        { key: 'Calories', value: '7 kcal per sachet' },
      ],
      reviews: 'good',
    },
    {
      name: 'Pet Grooming Kit (7-in-1)',
      description: 'Complete pet grooming set with slicker brush, deshedding comb, nail clipper, nail file, flea comb, grooming scissors, and storage pouch. Suitable for dogs and cats of all sizes.',
      price: 899,
      discountPrice: 649,
      category: c('Pet Supplies'), brand: b('Drools'), stock: 55,
      images: [unsplash('photo-1516734212186-a967f81ad0d7')],
      tags: ['grooming', 'pet', 'brush', 'nail-clipper', 'kit'],
      specifications: [
        { key: 'Items', value: '7' },
        { key: 'For', value: 'Dogs & Cats' },
        { key: 'Includes', value: 'Brush, Comb, Clipper, Scissors + More' },
      ],
      reviews: 'good',
    },
  ];
};

/* ──────────────────────── MAIN SEED ──────────────────────── */
const run = async () => {
  await connectDB();
  console.log('\n🌱 Seeding ShopNest database...\n');

  // --- Clear existing data ---
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});
  console.log('✓ Cleared existing products, categories, and brands\n');

  // --- Admin account ---
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shopnest.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`✓ Admin created: ${adminEmail}`);
  } else {
    console.log(`✓ Admin already exists: ${adminEmail}`);
  }

  // --- Reviewer accounts ---
  const reviewerAccounts = [];
  for (const name of REVIEWER_NAMES) {
    const email = name.toLowerCase().replace(/\s+/g, '.') + '@shopnest.com';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: 'Reviewer@12345',
        role: 'customer',
        isEmailVerified: true,
      });
    }
    reviewerAccounts.push(user);
  }
  const reviewerIds = reviewerAccounts.map((u) => u._id);
  console.log(`✓ ${REVIEWER_NAMES.length} reviewer accounts ready\n`);

  // --- Categories ---
  const categories = {};
  for (const catData of CATEGORIES) {
    const cat = await Category.create(catData);
    categories[catData.name] = cat;
  }
  console.log(`✓ ${CATEGORIES.length} categories created`);
  console.log(`  ${CATEGORIES.map((c) => c.name).join(', ')}\n`);

  // --- Brands ---
  const brands = {};
  for (const name of BRANDS) {
    const brand = await Brand.create({ name });
    brands[name] = brand;
  }
  console.log(`✓ ${BRANDS.length} brands created`);
  console.log(`  ${BRANDS.join(', ')}\n`);

  // --- Products ---
  const productsData = buildProducts(categories, brands);
  let count = 0;

  for (const pData of productsData) {
    const reviewType = pData.reviews || 'good';
    delete pData.reviews;

    // Build reviews with real user IDs
    const templateReviews = REVIEW_TEMPLATES[reviewType];
    const reviews = templateReviews.map((r, i) => ({
      user: reviewerIds[i % reviewerIds.length],
      name: REVIEWER_NAMES[i % REVIEWER_NAMES.length],
      rating: r.rating,
      comment: r.comment,
    }));

    // Calculate ratings
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const product = await Product.create({
      ...pData,
      seller: admin._id,
      reviews,
      ratings: Math.round(avgRating * 10) / 10,
      numReviews: reviews.length,
    });

    count++;
    console.log(`  + [${product.category ? CATEGORIES.find((_, idx) => Object.values(categories)[idx]?._id?.toString() === product.category.toString())?.name || '?' : '?'}] ${product.name} — ₹${product.discountPrice || product.price}`);
  }

  console.log(`\n✅ Seeding complete! ${count} products created across ${CATEGORIES.length} categories.\n`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
