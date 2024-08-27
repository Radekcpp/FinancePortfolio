//Imports
const express = require('express');
const axios = require('axios');

//Express Definition/Variables
const app = express()
const port = 3000
//const apiKey = "4bb4629b19c8d2e1fd3dd512"
app.use(express.json());

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize('stock', 'root', 'c0nygre', {
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