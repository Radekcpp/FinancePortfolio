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
const password = process.env.PASSWORD;
const apikey = process.env.APIKEY;
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

    const { username, stock_name, amount_bought, date_of_buying } = req.body;

    //TODO: price per share taken from api not passed
    const url = `https://api.polygon.io/v2/aggs/ticker/${stock_name}/range/1/day/${date_of_buying}/${date_of_buying}?apiKey=${apikey}`
                            
    try {
        // Fetch the stock price from the API
        const response = await axios.get(url);
        const data = response.data;

        // Ensure there is at least one result in the response
        if (data.results && data.results.length > 0) {
            const price_per_share = data.results[0].o;
            
            // Create the new stock entry with the fetched price_per_share
            const newStock = await Stock.create({ username, stock_name, amount_bought, date_of_buying, price_per_share });
            console.log(newStock);
            res.status(201).json({ message: 'Stock added successfully', id: newStock.id });
        } else {
            res.status(404).json({ error: 'Wrong stock name' });
        }
    } catch (err) {
        console.error(err);
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
//========================================================================================================\\
//BELOW DATA FOR CHARTS EITHER DELETE (BE MINDFUL OF APP.LISTEN AT THE END), COMMENT OR IGNORE IT :)))
//==========================================================================================================\\



//CHARTS
// Fetch daily historical data for each stock
// async function fetchStockData(stock) {
//     const today = new Date();
//     //end date - today
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month
//     const day = String(today.getDate()).padStart(2, '0');

//     const todaysDate = `${year}-${month}-${day}`;
//     //start date - 3 months prior
//     const threeMonthsAgo = new Date(today);
//     threeMonthsAgo.setMonth(today.getMonth() - 3);

//     // Extract year, month, day from threeMonthsAgo
//     const yearThreeMonthsPrior = threeMonthsAgo.getFullYear();
//     const monthThreeMonthsPrior = String(threeMonthsAgo.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
//     const dayThreeMonthsPrior = String(threeMonthsAgo.getDate()).padStart(2, '0');

//     // Format the date correctly
//     const dateThreeMonthsPrior = `${yearThreeMonthsPrior}-${monthThreeMonthsPrior}-${dayThreeMonthsPrior}`;
//     const url = `https://api.polygon.io/v2/aggs/ticker/${stock}/range/1/day/${dateThreeMonthsPrior}/${todaysDate}?apiKey=${apikey}`;
//     const response = await axios.get(url);
    
//     // Extract the opening prices from the response
//     const stockData = response.data.results;
//     const openingPrices = stockData.map(data => data.o); // 'o' is the opening price

//     return openingPrices;
// }

async function fetchStockData(stock) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
    const day = String(today.getDate()).padStart(2, '0');
    const todaysDate = `${year}-${month}-${day}`;

    // Calculate date 3 months prior
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const yearThreeMonthsPrior = threeMonthsAgo.getFullYear();
    const monthThreeMonthsPrior = String(threeMonthsAgo.getMonth() + 1).padStart(2, '0');
    const dayThreeMonthsPrior = String(threeMonthsAgo.getDate()).padStart(2, '0');
    const dateThreeMonthsPrior = `${yearThreeMonthsPrior}-${monthThreeMonthsPrior}-${dayThreeMonthsPrior}`;

    const url = `https://api.polygon.io/v2/aggs/ticker/${stock}/range/1/day/${dateThreeMonthsPrior}/${todaysDate}?apiKey=${apikey}`;
    const response = await axios.get(url);

    // Ensure that response.data.results is valid
    if (!Array.isArray(response.data.results)) {
        console.log("========================================")
        console.log(typeof(response.data.results))
        throw new Error('Invalid response format from Polygon.io API');
    }

    // Extract the opening prices and dates from the response
    const stockData = response.data.results;
    const openingPrices = stockData.map(data => {
        if (!data.t || !data.o) {
            console.error('Invalid data format:', data);
            return null;
        }
        return {
            date: new Date(data.t).toISOString().split('T')[0],
            open: data.o
        };
    }).filter(item => item !== null);

    return openingPrices;
}

async function calculateNetWorth(stocks, amounts) {
    let netWorthData = {};

    // Fetch and aggregate stock data
    for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i];
        const amount = amounts[i];
        const stockData = await fetchStockData(stock);

        stockData.forEach(data => {
            const date = data.date; // Use the formatted date
            if (!netWorthData[date]) {
                netWorthData[date] = 0;
            }
            netWorthData[date] += data.open * amount; // Multiply by amount
        });
    }

    // Prepare data for Chart.js
    const dates = Object.keys(netWorthData).sort();
    const values = dates.map(date => netWorthData[date]);

    return { dates, values };
}
// Serve the chart
app.get('/chart', async (req, res) => {
    let stocks = [];
    let amounts = [];
    stocks.push("AMZN");
    amounts.push(60)
    const days = 64;
    const netWorths = await calculateNetWorth(stocks, amounts);

    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (days - i));
        return date.toISOString().split('T')[0];
    }).reverse();
    console.log(dates, netWorths);
    res.json({ dates, values: netWorths })
});
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

app.listen(port, () => console.log(`Exchange app listening on port ${port}!`))