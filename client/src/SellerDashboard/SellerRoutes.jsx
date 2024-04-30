import React from "react";
import { Route, Routes } from "react-router-dom";
import ViewProducts from "./viewProducts";
import AddProduct from "./addProduct";
import SellerDashboard from "./SellerDashboard";

const SellerRoutes = () => {
	return (
		<Routes>
			<Route path="/" element={<SellerDashboard />} />
			<Route path="/product" element={<ViewProducts />} />
			<Route path="/add-product" element={<AddProduct />} />
		</Routes>
	);
};

export default SellerRoutes;
