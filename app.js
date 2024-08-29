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
        console.log("entered try block")
        const var_share_information = await Stock.findAll(
        {
            where: {
                username: username  
            }
        }); 
        // add logs to see the response, log a message that it was successful
        console.log("It was successful!!!!");
        console.log(var_share_information);
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
    // TODO: call polygon.io, check if stock exists and pull the price on the given date
    try {
      const newStock = await Stock.create({ username, stock_name, amount_bought, date_of_buying, price_per_share});
      console.log(newStock);
      res.status(201).json({ message: 'Stock added successfully', id: newStock.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

});

//TODO GET endpoint, get the name of stock and get the current price.

app.get('/getting_current_price', async (req, res) => {
    const { stock_name } = req.query;

    const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${stock_name}/range/1/day/2023-01-09/2023-02-10?adjusted=true&sort=asc&apiKey=zRfpponTPZJx86i5Vezn8VEivUng6cjO`

    // Make a GET request to the external API
    const response = await axios.get(apiUrl);

    // Extract data from the response
    const data = response.data.results[0].o;
    console.log(data);

    // Send the data as the response
    res.json(data);




})
// TODO 3 : calculate profit and net worth
// what stocks do i have, how many stocks each i have, check current price of  a stock * amount of stocks, and sum all.
// Endpoint to calculate profit and net worth for a specific user

app.get('/calculate_profit_and_networth', async (req, res) => {
    const { username } = req.query;
    console.log(username);

    if (!username) {
        return res.status(400).json({ error: "Username is required." });
    }

    try {
        const userStocks = await Stock.findAll({
            where: { username }
        });

        if (userStocks.length === 0) {
            return res.status(404).json({ message: "No stocks found for this username." });
        }

        let totalNetWorth = 0;
        let totalProfit = 0;

        for (const stock of userStocks) {
            // getting current price of each stock
            const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${stock.stock_name}/prev?apiKey=${process.env.APIKEY}`;
            const response = await axios.get(apiUrl);
            const currentPrice = response.data.results[0]?.o || 0;

            const currentValue = currentPrice * stock.amount_bought;
            totalNetWorth += currentValue;

            // Calculate the profit (current value - initial investment)
            const initialInvestment = stock.price_per_share * stock.amount_bought;
            const profit = currentValue - initialInvestment;
            totalProfit += profit;
        }

        res.json({
            net_worth: totalNetWorth,
            profit: totalProfit
        });

    } catch (err) {
        console.error("Error calculating profit and net worth:", err.message);
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