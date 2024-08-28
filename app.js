//Imports
const express = require('express');
const axios = require('axios');
require("dotenv").config();
//Express Definition/Variables
const app = express();
const port = 3000;
//const apiKey = "4bb4629b19c8d2e1fd3dd512"
app.use(express.json());
app.use(express.static('public'));
const password = process.env.PASSWORD
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize('stock', 'root', password, {
    host: "hsbcpolanddocker1.neueda.com",
    dialect: 'mysql',
})

const Stock = sequelize.define('stock_model', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stock_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount_bought: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date_of_buying: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    price_per_share: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    }, {
        tableName: 'share_information',
        timestamps: false,
})

// Getting information, without having to put a query parameter : 
app.get('/get_all_user_info', async (req, res) => {
    
    try {
        const var_share_information = await Stock.findAll();
        res.json(var_share_information);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Getting information of one specific user : 
app.get('/get_user_info', async (req, res) => {
    const { username } = req.query;
    try {
        const var_share_information = await Stock.findAll(
        {
            where: {
                username: username  
            }
        }); 
        res.json(var_share_information);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// changing date and amount_bought
// PUT endpoint : 
app.put('/update_stock/:id', async (req, res) => {
    const stockId = req.params.id;
    const { amount_bought, date_of_buying } = req.body;
 
    try {
        // Finding  the stock by ID
        const stock = await Stock.findByPk(stockId);
 
        if (!stock) {
            return res.status(404).json({ message: `Stock with ID ${stockId} not found.` });
        }
 
        // Updating amount bought and date_of_buying
        stock.amount_bought = amount_bought !== undefined ? amount_bought : stock.amount_bought;
        stock.date_of_buying = date_of_buying !== undefined ? date_of_buying : stock.date_of_buying;
 
        await stock.save(); // Saving the changes
 
        res.status(200).json({ message: `Stock with ID ${stockId} updated successfully.`, stock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/add_stock', async (req, res) => {

    const { username, stock_name, amount_bought, date_of_buying, price_per_share } = req.body;

    try {
      const newStock = await Stock.create({ username, stock_name, amount_bought, date_of_buying, price_per_share});
      console.log(newStock);
      res.status(201).json({ message: 'Stock added successfully', id: newStock.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

});

app.delete('/delete_stock/:id', async (req, res) => {
    const stockId = req.params.id;

    try {
        const result = await Stock.destroy({ where: { id: stockId } });
        
        if (result) {
            res.status(200).json({ message: `Stock with ID ${stockId} deleted successfully.` });
        } else {
            res.status(404).json({ message: `Stock with ID ${stockId} not found.` });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(port, () => console.log(`Exchange app listening on port ${port}!`))