
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Create table
const createTable = `
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    category VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(10,2),
    originalPrice DECIMAL(10,2),
    stock VARCHAR(100),
    image TEXT,
    unit VARCHAR(50)
)
`;

db.query(createTable, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Products Table Ready");
    }
});

// Get all products
app.get('/products', (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// Test route
app.get('/test', (req, res) => {
    res.json({
        message: "Backend Connected Successfully"
    });
});

// Insert products
app.get('/insert-products', (req, res) => {

    const products = [
        [
            "UltraTech OPC 53 Grade Cement 50kg",
            "Cement",
            "UltraTech",
            420,
            455,
            "100",
            "https://images.jdmagicbox.com/quickquotes/images_main/ultratech-opc-53-cement-385483500-zlzah.jpeg",
            "bag"
        ],
        [
            "ACC Gold Water Shield Cement 50kg",
            "Cement",
            "ACC",
            405,
            440,
            "100",
            "https://5.imimg.com/data5/SELLER/Default/2025/8/533002874/GC/XG/FD/250337182/acc-gold-water-shield-cement.jpeg",
            "bag"
        ]
    ];

    const sql = `
        INSERT INTO products
        (title, category, brand, price, originalPrice, stock, image, unit)
        VALUES ?
    `;

    db.query(sql, [products], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.send(`${result.affectedRows} products inserted`);
    });

});



app.post("/add-product", (req, res) => {
  const {
    title,
    category,
    brand,
    price,
    originalPrice,
    stock,
    image,
    unit,
  } = req.body;

  const sql = `
    INSERT INTO products
    (title, category, brand, price, originalPrice, stock, image, unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, category, brand, price, originalPrice, stock, image, unit],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({ message: "Product Added Successfully" });
    }
  );
});



app.delete("/products/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM products WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({ message: "Product deleted successfully" });
    }
  );
});





app.put("/products/:id", (req, res) => {
  const { id } = req.params;

  const {
    title,
    category,
    brand,
    price,
    originalPrice,
    stock,
    image,
    unit,
  } = req.body;

  const sql = `
    UPDATE products
    SET
      title = ?,
      category = ?,
      brand = ?,
      price = ?,
      originalPrice = ?,
      stock = ?,
      image = ?,
      unit = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      category,
      brand,
      price,
      originalPrice,
      stock,
      image,
      unit,
      id,
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        message: "Product updated successfully",
      });
    }
  );
});





const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});