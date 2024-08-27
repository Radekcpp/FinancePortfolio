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


app.listen(port, () => console.log(`Exchange app listening on port ${port}!`))