CREATE TABLE share_information
(
ID INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) NOT NULL,
stock_name VARCHAR(50) NOT NULL,
amount_bought INT NOT NULL,
date_of_buying DATE NOT NULL,
price_per_share DECIMAL(10,2) NOT NULL
);

INSERT INTO share_information (username, stock_name, amount_bought, date_of_buying, price_per_share)
VALUES 
('john_doe', 'AAPL', 100, '2023-09-15', 145.23),
('jane_smith', 'GOOGL', 50, '2023-07-30', 2734.85),
('alice_jones', 'AMZN', 25, '2023-05-21', 3478.12),
('bob_brown', 'TSLA', 30, '2024-01-10', 895.50),
('charlie_martin', 'NFLX', 20, '2023-11-05', 515.76),
('david_clark', 'MSFT', 40, '2024-03-12', 299.99),
('emma_wilson', 'FB', 75, '2024-04-20', 325.12),
('oliver_davis', 'NVDA', 60, '2023-08-01', 210.50),
('lucy_moore', 'INTC', 200, '2023-12-30', 54.25),
('jack_thomas', 'AMD', 150, '2023-10-20', 102.10);
