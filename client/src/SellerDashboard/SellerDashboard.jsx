import React from "react";
import { Link } from "react-router-dom";

const SellerDashboard = () => {
	return (
		<div className="text-center p-8">
			<h1 className="text-3xl font-bold mb-8">
				Seller Admin Dashboard
			</h1>
			<div className="flex justify-center mb-4">
				<Link to="/seller/products" className="mr-4">
					<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						View Products
					</button>
				</Link>
				<Link to="/seller/add-product">
					<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						Add Product
					</button>
				</Link>
			</div>
		</div>
	);
};

export default SellerDashboard;
