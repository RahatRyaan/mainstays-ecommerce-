import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/models/User';
import { Product } from '../src/models/Product';
import { Review } from '../src/models/Review';
import { Coupon } from '../src/models/Coupon';
import { Order } from '../src/models/Order';
import { SubOrder } from '../src/models/SubOrder';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
    console.log(`Connecting to database...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
    console.log(`Connected successfully to MongoDB Atlas!`);

    // Clear existing data
    console.log('Clearing old data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await SubOrder.deleteMany({});

    // 1. Create Users (Admin, Vendors, Customers)
    console.log('Creating users with rich profile data...');
    const admin = await User.create({
      name: 'Super Administrator',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: '742 Evergreen Terrace, Suite 100',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States',
    });

    await User.create({
      name: 'Super Admin Secondary',
      email: 'admin@ecommerce.com',
      password: 'AdminPassword123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: '742 Evergreen Terrace',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States',
    });

    const vendor1 = await User.create({
      name: 'Tech Haven Ltd.',
      email: 'vendor@test.com',
      password: 'password123',
      role: 'vendor',
      phone: '+1 (555) 839-2041',
      address: '108 Artisan Way, Studio 4B',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States',
      storeName: 'Tech Haven Ltd.',
      businessType: 'Minimalist Workspace & Tech Accessories',
      taxId: 'US-938201948',
      businessPhone: '+1 (555) 839-2040',
      bankAccount: 'US-WF-938102948190',
      payoutEmail: 'payouts@techhaven.com',
      bio: 'Crafting precision aluminum stands, woven cables, and ergonomic desk accessories since 2018.',
    });

    const vendor2 = await User.create({
      name: 'Aura Studio Fashion',
      email: 'aurafashion@vendor.com',
      password: 'VendorPass123!',
      role: 'vendor',
      phone: '+1 (555) 482-9102',
      address: '220 Silk Mill Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'United States',
      storeName: 'Aura Studio',
      businessType: 'Organic Linen & Raw Silk Apparel',
      taxId: 'US-482019283',
      businessPhone: '+1 (555) 482-9100',
      bankAccount: 'US-CH-481920381902',
      payoutEmail: 'billing@aurafashion.com',
      bio: 'Sustainable, small-batch ethical tailoring using unbleached organic linen.',
    });

    const vendor3 = await User.create({
      name: 'Nordic Home Living',
      email: 'nordichome@vendor.com',
      password: 'VendorPass123!',
      role: 'vendor',
      phone: '+1 (555) 392-0194',
      address: '45 Fjord Craft Lane',
      city: 'Minneapolis',
      state: 'MN',
      zipCode: '55401',
      country: 'United States',
      storeName: 'Nordic Home Living',
      businessType: 'Solid Walnut Furniture & Ceramics',
      taxId: 'US-392019482',
      businessPhone: '+1 (555) 392-0190',
      bankAccount: 'US-BOA-391029481920',
      payoutEmail: 'accounts@nordichome.com',
      bio: 'Hand-turned ceramic vessels and FSC-certified solid walnut goods designed for lifetime utility.',
    });

    const vendor4 = await User.create({
      name: 'Glow Botanical Beauty',
      email: 'glowbeauty@vendor.com',
      password: 'VendorPass123!',
      role: 'vendor',
      phone: '+1 (555) 928-4019',
      address: '88 Meadowbrook Road',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'United States',
      storeName: 'Glow Botanicals',
      businessType: 'Cold-Pressed Botanical Skincare',
      taxId: 'US-928401928',
      businessPhone: '+1 (555) 928-4010',
      bankAccount: 'US-CITI-928102938192',
      payoutEmail: 'founders@glowbotanicals.com',
      bio: 'Wild-harvested herbal elixirs, organic tallow balms, and slow-infused apothecary staples.',
    });

    const vendor5 = await User.create({
      name: 'Little Sprouts Craft Atelier',
      email: 'littlesprouts@vendor.com',
      password: 'password123',
      role: 'vendor',
      phone: '+1 (555) 718-2940',
      address: '320 Woodland Meadow Trail',
      city: 'Burlington',
      state: 'VT',
      zipCode: '05401',
      country: 'United States',
      storeName: 'Little Sprouts Atelier',
      businessType: 'Montessori Wooden Toys & Organic Nursery Goods',
      taxId: 'US-718294019',
      businessPhone: '+1 (555) 718-2941',
      bankAccount: 'US-PNC-718294019283',
      payoutEmail: 'studio@littlesprouts.shop',
      bio: 'Hand-sanded solid beechwood toys, organic waffle swaddles, and heirloom nursery accents crafted with non-toxic, child-safe finishes.',
    });

    const customer1 = await User.create({
      name: 'Alex Johnson',
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 234-5678',
      address: '415 Main Street, Apt 3B',
      deliveryAddress: '415 Main Street, Apt 3B (Leave at porch)',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'United States',
    });

    const customer2 = await User.create({
      name: 'Sarah Miller',
      email: 'sarah@customer.com',
      password: 'Password123!',
      role: 'customer',
      phone: '+1 (555) 876-5432',
      address: '120 Oakridge Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'United States',
    });

    // 2. Create Active Coupons
    console.log('Creating promotional coupons...');
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    await Coupon.create([
      {
        code: 'WELCOME10',
        type: 'percentage',
        discountValue: 10,
        minOrderValue: 30,
        expiresAt: futureDate,
        isActive: true,
      },
      {
        code: 'SUMMER20',
        type: 'percentage',
        discountValue: 20,
        minOrderValue: 100,
        expiresAt: futureDate,
        isActive: true,
      },
      {
        code: 'FREESHIP',
        type: 'fixed',
        discountValue: 15,
        minOrderValue: 50,
        expiresAt: futureDate,
        isActive: true,
      },
      {
        code: 'VIP50',
        type: 'fixed',
        discountValue: 50,
        minOrderValue: 200,
        expiresAt: futureDate,
        isActive: true,
      },
    ]);

    // 3. Create Products with Variants, High-Res Images & Real Specifications
    console.log('Creating curated products...');
    const productsData = [
      // Electronics
      {
        name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        description: 'Industry-leading noise canceling with two processors and 8 microphones for unprecedented call quality and immersive listening. Features crystal clear hands-free calling with 4 beamforming microphones and up to 30 hours of battery life.',
        vendor: vendor1._id,
        category: 'Electronics',
        tags: ['Audio', 'Headphones', 'Bluetooth', 'Noise-Canceling', 'Best-Seller'],
        basePrice: 349.99,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'SONY-XM5-BLK', attributes: { color: 'Midnight Black' }, priceAdjustment: 0, stock: 24, lowStockThreshold: 5 },
          { sku: 'SONY-XM5-SLV', attributes: { color: 'Platinum Silver' }, priceAdjustment: 0, stock: 12, lowStockThreshold: 3 },
          { sku: 'SONY-XM5-BLU', attributes: { color: 'Midnight Blue' }, priceAdjustment: 20, stock: 6, lowStockThreshold: 2 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 48,
      },
      {
        name: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
        slug: 'apple-macbook-pro-16-m3-max',
        description: 'The most advanced Mac laptop ever for demanding workflows. Powered by the M3 Max chip with up to a 16-core CPU and 40-core GPU, Liquid Retina XDR display, up to 22 hours of battery life, and comprehensive pro connectivity.',
        vendor: vendor1._id,
        category: 'Electronics',
        tags: ['Apple', 'Laptops', 'M3 Max', 'Pro Gear', 'Tech'],
        basePrice: 2499.00,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'MBP16-SPBLK-1TB', attributes: { color: 'Space Black', storage: '1TB' }, priceAdjustment: 0, stock: 8, lowStockThreshold: 2 },
          { sku: 'MBP16-SLV-1TB', attributes: { color: 'Silver', storage: '1TB' }, priceAdjustment: 0, stock: 5, lowStockThreshold: 2 },
          { sku: 'MBP16-SPBLK-2TB', attributes: { color: 'Space Black', storage: '2TB' }, priceAdjustment: 400, stock: 4, lowStockThreshold: 1 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 32,
      },
      {
        name: 'Mechanical Custom RGB Gaming Keyboard Pro 75%',
        slug: 'mechanical-rgb-gaming-keyboard-pro',
        description: 'Hot-swappable mechanical switches with pre-lubed stabilizers, gasket mounted design, aluminum frame, customizable RGB backlight, and sound-dampening acoustic foams.',
        vendor: vendor1._id,
        category: 'Electronics',
        tags: ['Gaming', 'Keyboard', 'RGB', 'Desk Setup', 'Mechanical'],
        basePrice: 129.99,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'KB-RED-WHT', attributes: { switch: 'Linear Red', color: 'Chalk White' }, priceAdjustment: 0, stock: 35, lowStockThreshold: 5 },
          { sku: 'KB-BRN-BLK', attributes: { switch: 'Tactile Brown', color: 'Stealth Black' }, priceAdjustment: 0, stock: 18, lowStockThreshold: 4 }
        ],
        isActive: true,
        averageRating: 4.8,
        reviewCount: 19,
      },
      {
        name: 'Ultra Titanium Smart Fitness Watch GPS 49mm',
        slug: 'ultra-titanium-smart-fitness-watch',
        description: 'Rugged titanium case, sapphire crystal front, precision dual-frequency GPS, depth gauge, up to 36 hours of battery life, and advanced biometric health monitoring.',
        vendor: vendor1._id,
        category: 'Electronics',
        tags: ['Wearable', 'Smartwatch', 'Fitness', 'GPS', 'Titanium'],
        basePrice: 399.00,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'WATCH-ORANGE-LOOP', attributes: { band: 'Alpine Orange', size: '49mm' }, priceAdjustment: 0, stock: 15, lowStockThreshold: 3 },
          { sku: 'WATCH-BLACK-OCEAN', attributes: { band: 'Ocean Black', size: '49mm' }, priceAdjustment: 10, stock: 20, lowStockThreshold: 4 }
        ],
        isActive: true,
        averageRating: 4.7,
        reviewCount: 27,
      },

      // Fashion
      {
        name: 'Italian Merino Wool Tailored Modern Blazer',
        slug: 'italian-merino-wool-tailored-blazer',
        description: 'Crafted from 100% fine Italian merino wool with a natural drape and soft-touch finish. Featuring notch lapels, pick-stitching, functional surgeon cuffs, and dual side vents for the quintessential sharp silhouette.',
        vendor: vendor2._id,
        category: 'Fashion',
        tags: ['Menswear', 'Suits', 'Formal', 'Luxury', 'Wool'],
        basePrice: 289.00,
        images: [
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'BLAZER-NVY-38R', attributes: { color: 'Navy Blue', size: '38R' }, priceAdjustment: 0, stock: 10, lowStockThreshold: 2 },
          { sku: 'BLAZER-NVY-40R', attributes: { color: 'Navy Blue', size: '40R' }, priceAdjustment: 0, stock: 14, lowStockThreshold: 3 },
          { sku: 'BLAZER-CHAR-40R', attributes: { color: 'Charcoal Grey', size: '40R' }, priceAdjustment: 10, stock: 8, lowStockThreshold: 2 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 22,
      },
      {
        name: 'Minimalist Full-Grain Leather Low-Top Sneakers',
        slug: 'minimalist-full-grain-leather-sneakers',
        description: 'Handcrafted in Portugal using buttery full-grain Italian leather, supple calfskin lining, and durable Margom vulcanized rubber outsoles. Clean, versatile style for both casual and semi-formal wear.',
        vendor: vendor2._id,
        category: 'Fashion',
        tags: ['Shoes', 'Sneakers', 'Leather', 'Minimalist', 'Footwear'],
        basePrice: 179.50,
        images: [
          'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'SNK-WHT-41', attributes: { color: 'Pure White', size: 'EU 41 / US 8' }, priceAdjustment: 0, stock: 16, lowStockThreshold: 3 },
          { sku: 'SNK-WHT-42', attributes: { color: 'Pure White', size: 'EU 42 / US 9' }, priceAdjustment: 0, stock: 22, lowStockThreshold: 4 },
          { sku: 'SNK-WHT-43', attributes: { color: 'Pure White', size: 'EU 43 / US 10' }, priceAdjustment: 0, stock: 19, lowStockThreshold: 4 }
        ],
        isActive: true,
        averageRating: 4.8,
        reviewCount: 38,
      },
      {
        name: 'Pure Cashmere Cable-Knit Crewneck Sweater',
        slug: 'pure-cashmere-cable-knit-sweater',
        description: 'Sumptuously soft 100% Grade-A Mongolian cashmere with intricate cable-knit patterning. Ribbed collar, cuffs, and hem ensure lasting shape retention and unparalleled warmth without weight.',
        vendor: vendor2._id,
        category: 'Fashion',
        tags: ['Knitwear', 'Cashmere', 'Winter', 'Luxury', 'Apparel'],
        basePrice: 215.00,
        images: [
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'CASH-OAT-S', attributes: { color: 'Oatmeal', size: 'S' }, priceAdjustment: 0, stock: 8, lowStockThreshold: 2 },
          { sku: 'CASH-OAT-M', attributes: { color: 'Oatmeal', size: 'M' }, priceAdjustment: 0, stock: 15, lowStockThreshold: 3 },
          { sku: 'CASH-OAT-L', attributes: { color: 'Oatmeal', size: 'L' }, priceAdjustment: 0, stock: 11, lowStockThreshold: 2 }
        ],
        isActive: true,
        averageRating: 5.0,
        reviewCount: 14,
      },
      {
        name: 'Heritage Full-Grain Leather Weekender Travel Duffle',
        slug: 'heritage-leather-weekender-duffle',
        description: 'Handcrafted vegetable-tanned full-grain leather that patinas beautifully over years of travel. Features solid brass YKK hardware, dedicated shoe compartment, and padded shoulder strap.',
        vendor: vendor2._id,
        category: 'Fashion',
        tags: ['Bags', 'Travel', 'Leather', 'Luggage', 'Heritage'],
        basePrice: 245.00,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'BAG-COGNAC', attributes: { color: 'Cognac Brown' }, priceAdjustment: 0, stock: 12, lowStockThreshold: 2 },
          { sku: 'BAG-ESPRESSO', attributes: { color: 'Dark Espresso' }, priceAdjustment: 0, stock: 9, lowStockThreshold: 2 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 16,
      },

      // Home & Living
      {
        name: 'Artisan Matte Ceramic Pour-Over Coffee Dripper Set',
        slug: 'artisan-matte-ceramic-coffee-dripper-set',
        description: 'Hand-thrown stoneware pour-over dripper with thermal stability, heat-resistant borosilicate glass server (600ml), and solid walnut wood base.',
        vendor: vendor3._id,
        category: 'Home',
        tags: ['Coffee', 'Kitchen', 'Ceramics', 'Barista', 'Minimalist'],
        basePrice: 58.00,
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'COFFEE-MATTE-BLK', attributes: { finish: 'Matte Charcoal' }, priceAdjustment: 0, stock: 40, lowStockThreshold: 5 },
          { sku: 'COFFEE-SPECKLE-WHT', attributes: { finish: 'Speckled Sand' }, priceAdjustment: 0, stock: 28, lowStockThreshold: 4 }
        ],
        isActive: true,
        averageRating: 4.8,
        reviewCount: 31,
      },
      {
        name: 'Nordic Ergonomic Swivel Armchair in Textured Bouclé',
        slug: 'nordic-ergonomic-swivel-armchair',
        description: 'Scandinavian designed swivel chair featuring tactile ivory bouclé upholstery, sculpted lumbar curve support, high-density foam cushioning, and matte black steel star base.',
        vendor: vendor3._id,
        category: 'Home',
        tags: ['Furniture', 'Living Room', 'Nordic', 'Chair', 'Interior'],
        basePrice: 480.00,
        images: [
          'https://images.unsplash.com/photo-1580481077194-4d8cc3449339?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'CHAIR-BOUCLE-IVR', attributes: { fabric: 'Ivory Bouclé' }, priceAdjustment: 0, stock: 7, lowStockThreshold: 2 },
          { sku: 'CHAIR-VELVET-SAGE', attributes: { fabric: 'Sage Velvet' }, priceAdjustment: 35, stock: 4, lowStockThreshold: 1 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 18,
      },
      {
        name: 'Ultrasonic Ceramic Aromatherapy Essential Oil Diffuser',
        slug: 'ultrasonic-ceramic-aromatherapy-diffuser',
        description: 'Handmade matte porcelain cover, quiet ultrasonic vibrations (2.4MHz), ambient warm LED lighting, and auto shut-off safety when water runs dry.',
        vendor: vendor3._id,
        category: 'Home',
        tags: ['Wellness', 'Home Decor', 'Aromatherapy', 'Diffuser', 'Spa'],
        basePrice: 74.00,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'DIFF-WHT-180ML', attributes: { color: 'Terracotta White' }, priceAdjustment: 0, stock: 32, lowStockThreshold: 6 },
          { sku: 'DIFF-TERRA-180ML', attributes: { color: 'Desert Terracotta' }, priceAdjustment: 0, stock: 21, lowStockThreshold: 4 }
        ],
        isActive: true,
        averageRating: 4.7,
        reviewCount: 26,
      },
      {
        name: 'Organic French Washed Linen Duvet Cover Set',
        slug: 'organic-french-washed-linen-duvet-set',
        description: 'Woven from 100% Normandy flax linen pre-washed for effortless softness and relaxed texture. Naturally breathable and temperature-regulating for year-round sleep comfort.',
        vendor: vendor3._id,
        category: 'Home',
        tags: ['Bedding', 'Linen', 'Bedroom', 'Organic', 'Comfort'],
        basePrice: 195.00,
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'LINEN-QUEEN-SAGE', attributes: { size: 'Queen', color: 'Earthy Sage' }, priceAdjustment: 0, stock: 14, lowStockThreshold: 3 },
          { sku: 'LINEN-KING-SAGE', attributes: { size: 'King', color: 'Earthy Sage' }, priceAdjustment: 30, stock: 10, lowStockThreshold: 2 },
          { sku: 'LINEN-QUEEN-OAT', attributes: { size: 'Queen', color: 'Natural Oatmeal' }, priceAdjustment: 0, stock: 16, lowStockThreshold: 3 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 29,
      },

      // Beauty & Health
      {
        name: 'Botanical Multi-Hyaluronic Radiance Dew Serum (50ml)',
        slug: 'botanical-multi-hyaluronic-dew-serum',
        description: 'Advanced 5-tier molecular weight hyaluronic acid combined with organic niacinamide, snow mushroom extract, and marine bio-ferments for intense, deep multi-layer cellular hydration.',
        vendor: vendor4._id,
        category: 'Beauty',
        tags: ['Skincare', 'Serum', 'Clean Beauty', 'Anti-Aging', 'Hydration'],
        basePrice: 62.00,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1608248597359-25cb481878f4?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'SERUM-50ML', attributes: { volume: '50ml / 1.7 fl oz' }, priceAdjustment: 0, stock: 50, lowStockThreshold: 8 },
          { sku: 'SERUM-100ML', attributes: { volume: '100ml / 3.4 fl oz' }, priceAdjustment: 45, stock: 25, lowStockThreshold: 4 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 42,
      },
      {
        name: 'Pure Cold-Pressed Golden Rosehip & Jojoba Facial Oil',
        slug: 'cold-pressed-rosehip-jojoba-facial-oil',
        description: '100% certified organic, unrefined cold-pressed seed oils rich in essential fatty acids (Omega 3, 6 & 9) and Vitamin A to restore skin barrier elasticity and impart a luminous glow.',
        vendor: vendor4._id,
        category: 'Beauty',
        tags: ['Facial Oil', 'Organic', 'Clean Skincare', 'Glow', 'Cruelty-Free'],
        basePrice: 48.00,
        images: [
          'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'OIL-30ML', attributes: { size: '30ml Glass Pipette' }, priceAdjustment: 0, stock: 38, lowStockThreshold: 5 }
        ],
        isActive: true,
        averageRating: 4.8,
        reviewCount: 23,
      },
      {
        name: 'Antioxidant Vitamin C + E Glow Day Moisturizer Cream',
        slug: 'antioxidant-vitamin-c-glow-moisturizer',
        description: 'Clinically proven 15% stabilized Vitamin C (THD Ascorbate) and Vitamin E whipped into lightweight squalane and ceramides to visibly brighten dullness and defend against environmental stressors.',
        vendor: vendor4._id,
        category: 'Beauty',
        tags: ['Moisturizer', 'Vitamin C', 'Brightening', 'Skincare', 'Daily Routine'],
        basePrice: 54.00,
        images: [
          'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'CREAM-50G', attributes: { jar: '50ml Airless Jar' }, priceAdjustment: 0, stock: 45, lowStockThreshold: 6 }
        ],
        isActive: true,
        averageRating: 4.7,
        reviewCount: 35,
      },
      {
        name: 'Mineral UV Defense SPF 50 Broad Spectrum Sunscreen',
        slug: 'mineral-uv-defense-spf50-sunscreen',
        description: '100% non-nano zinc oxide mineral shield with invisible matte finish. Zero white cast, reef-safe, antioxidant-infused with green tea and chamomile for sensitive skin.',
        vendor: vendor4._id,
        category: 'Beauty',
        tags: ['Sunscreen', 'SPF 50', 'Mineral', 'Clean Beauty', 'UV Protection'],
        basePrice: 38.00,
        images: [
          'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'SPF-75ML', attributes: { size: '75ml' }, priceAdjustment: 0, stock: 60, lowStockThreshold: 10 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 51,
      },

      // Kids & Little Makers
      {
        name: 'Handcrafted Montessori Beechwood Rainbow Stacker',
        slug: 'handcrafted-montessori-beechwood-rainbow-stacker',
        description: 'Sculpted from sustainably harvested solid European beechwood. Finished with non-toxic, food-grade waterborne stains in gentle earthen tones for open-ended sensory learning and spatial play.',
        vendor: vendor5._id,
        category: 'Kids',
        tags: ['Montessori', 'Wooden Toys', 'Sensory Play', 'Non-Toxic', 'Heirloom'],
        basePrice: 42.00,
        images: [
          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'RAINBOW-EARTH-8PC', attributes: { palette: 'Earthen Terracotta & Sage' }, priceAdjustment: 0, stock: 35, lowStockThreshold: 5 },
          { sku: 'RAINBOW-PASTEL-8PC', attributes: { palette: 'Nordic Pastel Meadow' }, priceAdjustment: 0, stock: 24, lowStockThreshold: 4 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 38,
      },
      {
        name: 'Organic Waffle Cotton Toddler Knit Romper & Bonnet',
        slug: 'organic-waffle-cotton-toddler-romper-bonnet',
        description: '100% GOTS certified organic unbleached waffle cotton. Ultra-gentle on sensitive newborn and toddler skin, featuring natural coconut shell buttons and stretchy ribbed cuffs.',
        vendor: vendor5._id,
        category: 'Kids',
        tags: ['Baby Apparel', 'Organic Cotton', 'GOTS Certified', 'Toddler', 'Unisex'],
        basePrice: 38.00,
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'ROMPER-0-6M-OAT', attributes: { size: '0-6 Months', color: 'Warm Oat' }, priceAdjustment: 0, stock: 20, lowStockThreshold: 3 },
          { sku: 'ROMPER-6-12M-OAT', attributes: { size: '6-12 Months', color: 'Warm Oat' }, priceAdjustment: 0, stock: 25, lowStockThreshold: 4 },
          { sku: 'ROMPER-12-24M-SAGE', attributes: { size: '12-24 Months', color: 'Muted Sage' }, priceAdjustment: 0, stock: 18, lowStockThreshold: 3 }
        ],
        isActive: true,
        averageRating: 5.0,
        reviewCount: 29,
      },
      {
        name: 'Hand-Tufted Wool Friendly Woodland Bear Nursery Rug',
        slug: 'hand-tufted-wool-woodland-bear-nursery-rug',
        description: 'Soft 100% New Zealand wool hand-tufted by master artisans. High-pile plush surface provides a warm, cushioned play area for tummy time and nursery floor storytelling.',
        vendor: vendor5._id,
        category: 'Kids',
        tags: ['Nursery Decor', 'Wool Rug', 'Hand-Tufted', 'Kids Room', 'Cozy'],
        basePrice: 94.00,
        images: [
          'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'RUG-BEAR-3FT', attributes: { diameter: '3ft Round (90cm)' }, priceAdjustment: 0, stock: 15, lowStockThreshold: 3 },
          { sku: 'RUG-BEAR-4FT', attributes: { diameter: '4ft Round (120cm)' }, priceAdjustment: 40, stock: 10, lowStockThreshold: 2 }
        ],
        isActive: true,
        averageRating: 4.8,
        reviewCount: 19,
      },
      {
        name: 'Pure Natural Beeswax Modeling Clay & Crayon Craft Kit',
        slug: 'natural-beeswax-modeling-clay-crayon-craft-kit',
        description: 'Made from 100% pure local beeswax and organic botanical plant pigments. Warm in the hands to sculpt easily, gluten-free, 100% petroleum-free, and delightfully honey-scented.',
        vendor: vendor5._id,
        category: 'Kids',
        tags: ['Art & Craft', 'Beeswax', 'Non-Toxic', 'Creative Play', 'Plant Pigments'],
        basePrice: 28.00,
        images: [
          'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'CRAFT-BEESWAX-12SET', attributes: { set: '12 Botanical Colors Kit' }, priceAdjustment: 0, stock: 50, lowStockThreshold: 8 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 44,
      },
      {
        name: 'Solid Birch Multi-Use Balance & Rocker Board',
        slug: 'solid-birch-multi-use-balance-rocker-board',
        description: 'Pressed from 10 layers of FSC-certified European birch with protective wool felt base. Serves as a balance board, slide, bridge, lounger, and open-ended imagination stage (supports up to 200kg).',
        vendor: vendor5._id,
        category: 'Kids',
        tags: ['Active Play', 'Balance Board', 'Waldorf', 'Montessori', 'FSC Certified'],
        basePrice: 85.00,
        images: [
          'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'BOARD-FELT-TERRA', attributes: { feltColor: 'Terracotta Felt' }, priceAdjustment: 0, stock: 22, lowStockThreshold: 4 },
          { sku: 'BOARD-FELT-OLIVE', attributes: { feltColor: 'Forest Olive Felt' }, priceAdjustment: 0, stock: 19, lowStockThreshold: 3 }
        ],
        isActive: true,
        averageRating: 4.9,
        reviewCount: 27,
      },
      {
        name: 'Hand-Stitched Heirloom Linen Woodland Fox Soft Doll',
        slug: 'hand-stitched-heirloom-linen-woodland-fox-doll',
        description: 'Handcrafted from pure Belgian stonewashed linen, organic cotton floral inner ears, and hypoallergenic kapok fiber stuffing. Designed to be a cherished childhood companion for years.',
        vendor: vendor5._id,
        category: 'Kids',
        tags: ['Soft Toy', 'Heirloom Doll', 'Linen', 'Handmade', 'Nursery Companion'],
        basePrice: 46.00,
        images: [
          'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { sku: 'FOX-RUST-LINEN', attributes: { size: '14 inch (35cm)' }, priceAdjustment: 0, stock: 28, lowStockThreshold: 5 }
        ],
        isActive: true,
        averageRating: 5.0,
        reviewCount: 33,
      }
    ];

    const createdProducts: any[] = await Product.create(productsData);
    console.log(`Created ${createdProducts.length} products.`);

    // 4. Create Sample Reviews
    console.log('Creating verified reviews...');
    const reviewsData = [
      {
        product: createdProducts[0]._id, // Sony Headphones
        user: customer1._id,
        rating: 5,
        comment: 'Unbelievable noise cancellation! I use these on flights and daily commutes. Battery lasts forever and they are so comfortable even with glasses.',
      },
      {
        product: createdProducts[0]._id,
        user: customer2._id,
        rating: 5,
        comment: 'Best audio purchase I have made in years. The soundstage and clarity are unmatched.',
      },
      {
        product: createdProducts[1]._id, // MacBook Pro
        user: customer1._id,
        rating: 5,
        comment: 'Blazing fast for 4K video rendering and software development. The display is gorgeous and battery life is legendary.',
      },
      {
        product: createdProducts[4]._id, // Blazer
        user: customer2._id,
        rating: 5,
        comment: 'The wool quality and cut are exquisite. Fits like custom bespoke tailoring. Worth every penny!',
      },
      {
        product: createdProducts[5]._id, // Sneakers
        user: customer1._id,
        rating: 5,
        comment: 'Minimalist perfection. Italian leather is buttery soft right out of the box with zero break-in period required.',
      },
      {
        product: createdProducts[8]._id, // Coffee Set
        user: customer2._id,
        rating: 5,
        comment: 'Beautiful aesthetic on the kitchen counter and produces such a clean, delicious brew every morning.',
      },
      {
        product: createdProducts[12]._id, // Serum
        user: customer2._id,
        rating: 5,
        comment: 'My skin has never looked so dewy and hydrated. Non-sticky formula and absorbs instantly under moisturizer.',
      },
    ];

    await Review.create(reviewsData);

    // 5. Create Sample Orders & SubOrders for Customer 1 (Alex Johnson)
    console.log('Creating sample orders with tracking history...');
    
    // Delivered Past Order
    const pastOrder = await Order.create({
      user: customer1._id,
      totalAmount: 608.99,
      subtotal: 638.99,
      tax: 0.00,
      shipping: 0.00,
      discount: 30.00,
      paymentStatus: 'paid',
      shippingAddress: '742 Evergreen Terrace, San Francisco, CA 94105, USA',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    });

    await SubOrder.create([
      {
        parentOrder: pastOrder._id,
        vendor: vendor1._id,
        items: [
          {
            product: createdProducts[0]._id, // Sony Headphones
            variantId: createdProducts[0].variants[0]._id,
            quantity: 1,
            price: 349.99,
          }
        ],
        subTotal: 349.99,
        status: 'delivered',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        parentOrder: pastOrder._id,
        vendor: vendor2._id,
        items: [
          {
            product: createdProducts[4]._id, // Blazer
            variantId: createdProducts[4].variants[0]._id,
            quantity: 1,
            price: 289.00,
          }
        ],
        subTotal: 289.00,
        status: 'delivered',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      }
    ]);

    // Active Processing Order
    const activeOrder = await Order.create({
      user: customer1._id,
      totalAmount: 237.50,
      subtotal: 237.50,
      tax: 0.00,
      shipping: 0.00,
      discount: 0.00,
      paymentStatus: 'paid',
      shippingAddress: '742 Evergreen Terrace, San Francisco, CA 94105, USA',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    });

    await SubOrder.create([
      {
        parentOrder: activeOrder._id,
        vendor: vendor2._id,
        items: [
          {
            product: createdProducts[5]._id, // Sneakers
            variantId: createdProducts[5].variants[1]._id,
            quantity: 1,
            price: 179.50,
          }
        ],
        subTotal: 179.50,
        status: 'shipped',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
      {
        parentOrder: activeOrder._id,
        vendor: vendor3._id,
        items: [
          {
            product: createdProducts[8]._id, // Coffee Set
            variantId: createdProducts[8].variants[0]._id,
            quantity: 1,
            price: 58.00,
          }
        ],
        subTotal: 58.00,
        status: 'processing',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      }
    ]);

    console.log('✅ Database seeded successfully with demo catalog, users, coupons, and orders!');
    console.log('\n--- Demo Accounts Summary ---');
    console.log('👑 Admin:     admin@ecommerce.com / AdminPassword123');
    console.log('🏪 Vendor 1:  techhaven@vendor.com / VendorPass123!');
    console.log('🏪 Vendor 2:  aurafashion@vendor.com / VendorPass123!');
    console.log('👤 Customer:  alex@customer.com / Password123!');
    console.log('🎟️ Coupons:   WELCOME10 (10% off), SUMMER20 (20% off), FREESHIP ($15 off), VIP50 ($50 off)');
    console.log('-----------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seed();
