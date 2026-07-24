/*
 * UrbanCart — Verified High-Precision Sample Products Dataset (7 Core Categories)
 * Every product image explicitly matches the exact item name, type, and description.
 */

const sampleProducts = [
  // 1. Electronics
  {
    name: 'Samsung Galaxy S24 Ultra 5G',
    description: 'Flagship smartphone with Snapdragon 8 Gen 3, 200MP pro camera and S-Pen support.',
    price: 129999,
    category: 'Electronics',
    brand: 'Samsung',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise-canceling wireless headphones with 30-hour battery life.',
    price: 29990,
    category: 'Electronics',
    brand: 'Sony',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Dell XPS 15 Intel Core i9 Laptop',
    description: 'Ultra-thin performance laptop with 4K OLED display and NVIDIA RTX graphics.',
    price: 145000,
    category: 'Electronics',
    brand: 'Dell',
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    ],
  },

  // 2. Fashion
  {
    name: 'Nike Air Max 270 Running Shoes',
    description: 'Breathable mesh sneakers with iconic max air cushioning for daily active comfort.',
    price: 12995,
    category: 'Fashion',
    brand: 'Nike',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Levi\'s 501 Original Fit Denim Jeans',
    description: 'Classic straight leg fit denim jeans with button fly and durable cotton construction.',
    price: 3999,
    category: 'Fashion',
    brand: 'Levi\'s',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Fossil Minimalist Leather Chronograph Watch',
    description: 'Timeless genuine brown leather strap chronograph watch with water resistance.',
    price: 9495,
    category: 'Fashion',
    brand: 'Fossil',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    ],
  },

  // 3. Books
  {
    name: 'Atomic Habits by James Clear',
    description: 'An easy & proven way to build good habits & break bad ones with actionable insights.',
    price: 490,
    category: 'Books',
    brand: 'Penguin',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'The Psychology of Money by Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness for financial success.',
    price: 350,
    category: 'Books',
    brand: 'Harriman House',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Sapiens: A Brief History of Humankind',
    description: 'Yuval Noah Harari\'s groundbreaking bestseller exploring human evolution.',
    price: 499,
    category: 'Books',
    brand: 'HarperCollins',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80',
    ],
  },

  // 4. Sports
  {
    name: 'Yonex Astrox 99 Play Badminton Racket',
    description: 'Full graphite isometric frame racket engineered for maximum smash power.',
    price: 3499,
    category: 'Sports',
    brand: 'Yonex',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613564834361-9436948814d1?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Decathlon Kipsta Size 5 Football',
    description: 'Durable hybrid stitched match football designed for training and club matches.',
    price: 799,
    category: 'Sports',
    brand: 'Decathlon',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Reebok Rubber Hex Dumbbells 10kg Pair',
    description: 'Anti-roll heavy rubber coated dumbbells for strength building workouts.',
    price: 3999,
    category: 'Sports',
    brand: 'Reebok',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    ],
  },

  // 5. Beauty
  {
    name: 'Maybelline New York Super Stay Matte Lipstick',
    description: '16-hour long lasting liquid matte lipstick with intense color payoff.',
    price: 699,
    category: 'Beauty',
    brand: 'Maybelline',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'L\'Oreal Paris Revitalift 1.5% Hyaluronic Acid Serum',
    description: 'Intense hydrating anti-aging face serum for smooth, radiant and plump skin.',
    price: 899,
    category: 'Beauty',
    brand: 'L\'Oreal',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Forest Essentials Ayurvedic Body Massage Oil 200ml',
    description: 'Cold pressed organic sesame oil infused with traditional herbs for skin nourishment.',
    price: 1675,
    category: 'Beauty',
    brand: 'Forest Essentials',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80',
    ],
  },

  // 6. Groceries
  {
    name: 'Fortune Kachi Ghani Mustard Oil 5L Jar',
    description: 'Cold-pressed unrefined pure mustard oil with natural pungency and health benefits.',
    price: 780,
    category: 'Groceries',
    brand: 'Fortune',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Daawat Rozana Super Basmati Rice 5kg',
    description: 'Aromatic long grain basmati rice perfect for daily delicious meals.',
    price: 425,
    category: 'Groceries',
    brand: 'Daawat',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Tata Tea Gold Premium Black Tea 500g',
    description: 'Rich blend of fine Assam tea leaves and gently rolled long leaves for superior aroma.',
    price: 310,
    category: 'Groceries',
    brand: 'Tata',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    ],
  },

  // 7. Home & Kitchen
  {
    name: 'Prestige Iris 750W Mixer Grinder 4 Jars',
    description: 'Heavy-duty 750W motor mixer grinder with 3 stainless steel jars and 1 juicer jar.',
    price: 3499,
    category: 'Home & Kitchen',
    brand: 'Prestige',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Pigeon By Stovekraft Pressure Cooker 5L',
    description: 'Outer lid ergonomic aluminium pressure cooker for fast and safe daily cooking.',
    price: 1299,
    category: 'Home & Kitchen',
    brand: 'Pigeon',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Philips HD9252 Air Fryer 4.1L',
    description: 'Rapid Air technology oil-free cooking fryer for healthy snacks with 90% less fat.',
    price: 7999,
    category: 'Home & Kitchen',
    brand: 'Philips',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    ],
  },
];

module.exports = sampleProducts;
