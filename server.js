require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ⚠️ DEPLOYMENT NOTE: Update .env file with your actual Database Server IP address when deploying.
const db = mysql.createPool({
    host: process.env.DB_HOST,      
    user: process.env.DB_USER,           
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed: ", err.message);
    } else {
        console.log("🚀 Connected to the MySQL Database Server successfully!");
        connection.release();
    }
});

// 1. READ (Get all products)
app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. CREATE (Add a product)
app.post('/api/products', (req, res) => {
    const { name, price } = req.body;
    const sql = "INSERT INTO products (name, price) VALUES (?, ?)";
    
    db.query(sql, [name, price], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, name, price });
    });
});

// 3. UPDATE (Edit a product)
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const { name, price } = req.body;
    const sql = "UPDATE products SET name = ?, price = ? WHERE id = ?";

    db.query(sql, [name, price, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ id, name, price });
    });
});

// 4. DELETE (Remove a product)
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});