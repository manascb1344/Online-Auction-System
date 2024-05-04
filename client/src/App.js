import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import socketIO from "socket.io-client";
import Nav from "./components/Nav";
import Home from "./components/Home";
import BidProduct from "./components/BidProduct";
import Products from "./components/Products";
import LoginForm from "./components/LoginForm";
import SellerDashboard from "./SellerDashboard/SellerDashboard";
import ViewProductsSeller from "./SellerDashboard/viewProducts";
import AddProductSeller from "./SellerDashboard/addProduct";
import AdminDashboard from "./Admin/AdminDashboard";
import Auctions from "./Admin/Auctions";
import Transactions from "./Admin/Transactions";
import Bids from "./Admin/Bids";


const socket = socketIO.connect("http://localhost:4000");

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const username = localStorage.getItem("username");
		if (username) {
			setIsLoggedIn(true);
		}
		setLoading(false);
	}, []);

	return (
		<div>
			<Nav header="Bid Items" socket={socket} />
			{loading ? (
				<div>Loading...</div>
			) : (
				<Routes>
					<Route path="/" element={<Home />} />
					<Route
						path="/products"
						element={
							isLoggedIn ? <Products /> : <Navigate to="/login" />
						}
					/>

					<Route
						path="/products/bid/:name/:price"
						element={
							isLoggedIn ? (
								<BidProduct socket={socket} />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/login"
						element={<LoginForm setIsLoggedIn={setIsLoggedIn} />}
					/>
					<Route path="/seller" element={<SellerDashboard />} />
					<Route
						path="/seller/products"
						element={<ViewProductsSeller />}
					/>
					<Route
						path="/seller/add-product"
						element={<AddProductSeller />}
					/>
					<Route
						path="/admin"
						element={<AdminDashboard />}
					/>
					<Route
						path="/admin/auctions"
						element={<Auctions />}
					/>
					<Route
						path="/admin/transactions"
						element={<Transactions />}
					/>
					<Route
						path="/admin/bids"
						element={<Bids />}
					/>
				</Routes>
			)}
		</div>
	);
}

export default App;
