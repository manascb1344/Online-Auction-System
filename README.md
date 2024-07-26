# Online Auction System

This project focuses on the design and implementation of a comprehensive database schema for managing users, items, bids, auctions, and transactions in an online auction environment. 🎉

## Project Overview

The Online Auction System is designed to facilitate seamless interactions between buyers, sellers, and admins through a well-structured database schema. Key features include:

- **User Management**: Centralized user profile management with details such as unique User_ID, Username, Password, Email, Address, preferred payment methods, and transaction history.
- **Item Management**: Detailed tracking of auction items with attributes like Item_ID, Seller_ID, Item_Name, Description, Starting_Price, Auction_End_Time, item condition, category, and images.
- **Bid Tracking**: Real-time bid tracking with unique Bid_ID, Bidder_ID, Item_ID, Bid_Amount, Bid_Time, bid status, and bid increment.
- **Auction Management**: Comprehensive auction tracking with Auction_ID, Item_ID, Auction_Start_Time, Auction_End_Time, auction status, and reserve price.
- **Transaction Recording**: Management of completed transactions with Transaction_ID, Buyer_ID, Seller_ID, Item_ID, Transaction_Amount, Transaction_Time, payment method, and transaction status.

## Tech Stack

This project leverages a variety of technologies to deliver a robust online auction system:

- **Frontend**:
  - **React.js**: For building the user interface and enhancing user experience.
  - **Tailwind-CSS**: For styling and responsive design.

- **Backend**:
  - **Node.js**: Server-side JavaScript runtime environment for building scalable network applications.
  - **Express.js**: Web application framework for Node.js to handle HTTP requests and routing.

- **Database**:
  - **MariaDB**: Relational SQL database management system for storing and managing data related to users, items, bids, auctions, and transactions.

- **Data Visualization**:
  - **Power BI**: For visualizing and analyzing data in real-time with interactive reports and dashboards.

- **Development Tools**:
  - **Git**: Version control system for tracking changes in source code.

## Getting Started

To get started with the Online Auction System project, follow these steps:

1. **Clone the Repository**
   ```bash
   https://github.com/manascb1344/Online-Auction-System.git
   cd Online-Auction-System
   // In Same Terminal Window
   cd client
   // In New Terminal Window
   cd server
   ```

2. **Install Dependencies**
   ```bash
   // In both Terminal Windows
   npm install
   ```

3. **Set Up MariaDB**
   - Ensure MariaDB is installed and running on your system.
   - Create a database and configure the connection settings in the project.

4. **Run the Application**
   ```bash
   npm start
   ```

## Demo & Documentation

Check out the following resources to better understand the project:

- **[Demo Video](link-to-demo-video)**: A video demonstration of the Online Auction System in action.

- **[PowerPoint Presentation](link-to-ppt)**: A presentation outlining the project details and architecture.
- **[Project Report](link-to-project-report)**: Comprehensive report detailing the project implementation and findings.

## Features

- **User Profiles**: Manage and view user profiles with complete transaction history.
- **Item Listings**: View and list items for auction with detailed information.
- **Real-Time Bidding**: Track and place bids in real-time.
- **Auction Management**: Start and manage auctions with reserve prices and status updates.
- **Transaction Processing**: Record and manage transactions post-auction.
