AQUACROCS PORTFOLIO MANAGEMENT

TABLE OF CONTENTS :
1) GEETING STARTED
2) OVERVIEW
3) TECHNICAL GOALS
4) TECHNOLOGIES USED
5) HOW TO USE IT
6) API ENDPOINTS

GETING STARTED
-First, node.js with npm needs to be installed.
-Clone the repository. (git clone <link>)
-Install dependencies from package.json. (npm install)
-Configure database and create .env file and store database password and apikey from polygon.io. 

OVERVIEW : 
The Aquacrocs Portfolio Management is a web application designed to manage a financial portfolio. Users can view, add, update, and remove their stocks, track their portfolio's performance, and view their net worth and profit. The application includes both a backend REST API and a frontend interface, with data stored in a MySQL database running on a Docker container.

TECHNICAL GOALS : 
-Backend: Develops a robust REST API to handle stock data management, including Create, Read, Update, and Delete (CRUD) operations for stock records. It also provides functionality to calculate net worth and profit based on user portfolios and integrates with the Polygon.io API to fetch real-time and historical stock prices for accurate updates and calculations.

-Frontend: Provides an intuitive user interface that allows users to interact with the backend API. Features include viewing and managing portfolio details, updating stock information, and tracking financial performance through a well-organized dashboard.

-Database: Utilizes MySQL for persistent storage of stock data. The MySQL database runs in a Docker container, ensuring a consistent and isolated environment for data management, which facilitates easy setup and scalability.

TECHNOLOGIES USED: 
-Backend: Node.js, Express, Sequelize
-Frontend: HTML, JavaScrpt, CSS
-Database: MySQL (Dockerized)
-External APIs: Polygon.io
-Project Management: JIRA (Kanban board)
-Version Control: Bitbucket, GitHub


API ENDPOINTS : 
GET /get_all_user_info: Retrieves all stock information for all users.
GET /get_user_info: Fetches stock information for a specific user by username.
PUT /update_stock/:id: Updates the amount bought and purchase date of a specific stock by ID.
POST /add_stock: Adds a new stock entry to the database.
GET /getting_current_price: Retrieves the current price of a specified stock.
GET /calculate_profit_and_networth: Calculates and returns the profit and net worth for a specific user.
GET /get_stock_by_name: Retrieves stock ID based on the stock name.
DELETE /delete_stock/:id: Deletes a specific stock entry by ID.
