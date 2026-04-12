const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(async (err) => {
  if (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to DB');

  try {
    // 1. Update orders table
    console.log('Updating orders table...');
    
    // Check if columns exist before adding
    const [cols] = await db.promise().query('DESCRIBE orders');
    const colNames = cols.map(c => c.Field);

    const additions = [];
    if (!colNames.includes('email')) additions.push('ADD COLUMN email VARCHAR(100)');
    if (!colNames.includes('mobile_number')) additions.push('ADD COLUMN mobile_number VARCHAR(20)');
    if (!colNames.includes('delivery_address')) additions.push('ADD COLUMN delivery_address TEXT');
    if (!colNames.includes('shipping_method')) additions.push('ADD COLUMN shipping_method VARCHAR(100)');
    if (!colNames.includes('courier_details')) additions.push('ADD COLUMN courier_details VARCHAR(255)');
    if (!colNames.includes('tracking_number')) additions.push('ADD COLUMN tracking_number VARCHAR(100)');
    
    // Change product to item_name if product exists and item_name doesnt
    if (colNames.includes('product') && !colNames.includes('item_name')) {
      additions.push('CHANGE COLUMN product item_name VARCHAR(200)');
    }
    
    // Change notes to remarks if notes exists and remarks doesnt
    if (colNames.includes('notes') && !colNames.includes('remarks')) {
      additions.push('CHANGE COLUMN notes remarks TEXT');
    }

    // 1.5 Update status enum to include BOTH old and new values temporarily
    console.log('Expanding status enum...');
    await db.promise().query("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'new', 'confirmed', 'returned') DEFAULT 'pending'");

    // 1.6 Update existing 'pending' status to 'new'
    console.log('Updating existing statuses...');
    await db.promise().query("UPDATE orders SET status = 'new' WHERE status = 'pending'");

    // 1.7 Finalize status enum (remove 'pending')
    additions.push("MODIFY COLUMN status ENUM('new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'new'");

    if (additions.length > 0) {
      await db.promise().query(`ALTER TABLE orders ${additions.join(', ')}`);
      console.log('Orders table updated successfully');
    } else {
      console.log('Orders table already up to date');
    }

    // 2. Create order_history
    console.log('Creating order_history table...');
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS order_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        status VARCHAR(50),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // 3. Create returns
    console.log('Creating returns table...');
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS returns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        reason TEXT,
        type ENUM('return', 'exchange') DEFAULT 'return',
        status ENUM('pending', 'approved', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // 4. Create customers
    console.log('Creating customers table...');
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.end();
  }
});
