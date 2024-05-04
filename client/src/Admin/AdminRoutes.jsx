import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import Auctions from "./Auctions";
import Transactions from "./Transactions";
import Bids from "./Bids";

const AdminRoutes = () => {
	return (
		<Routes>
			<Route path="/" element={<AdminDashboard />} />
			<Route path="/auctions" element={<Auctions />} />
			<Route path="/transactions" element={<Transactions />} />
            <Route path="/bids" element={<Bids />} />
		</Routes>
	);
};

export default AdminRoutes;
