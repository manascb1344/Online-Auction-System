import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Nav = ({ header }) => {
	const [notification, setNotification] = useState("");
	const navigate = useNavigate();
	const userType = localStorage.getItem("userType");
	const isLoggedIn = localStorage.getItem("username");

	const handleLogout = () => {
		localStorage.removeItem("seller_id");
		localStorage.removeItem("buyer_id");
		localStorage.removeItem("admin_id");
		localStorage.removeItem("username");
		localStorage.removeItem("userType");
		navigate("/login");
	};

	return (
		<nav className="w-full bg-gray-800 text-white mb-0">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<h2 className="text-xl font-semibold">{header}</h2>
					</div>
					<div className="flex items-center">
						<p className="text-red-500 mr-4">{notification}</p>
						{isLoggedIn && (
							<button
								className="px-4 py-2 bg-red-500 text-white rounded-md mr-2"
								onClick={handleLogout}
							>
								Logout
							</button>
						)}
					</div>
					<div>
						{userType === "seller" && (
							<div className="flex">
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
									onClick={() => navigate("/seller")}
								>
									Seller Dashboard
								</button>
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
									onClick={() => navigate("/seller/add-product")}
								>
									Add Product
								</button>
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md"
									onClick={() => navigate("/seller/products")}
								>
									View Products
								</button>
							</div>
						)}
						{userType === "buyer" && (
							<div className="flex">
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
									onClick={() => navigate("/products")}
								>
									View Products
								</button>
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
									onClick={() => navigate("/userprofile")}
								>
									UserProfile
								</button>

							</div>
						)}
						{userType === "admin" && (
							<div className="flex">
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
									onClick={() => navigate("/admin")}
								>
									Admin Dashboard
								</button>
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
									onClick={() => navigate("/admin/auctions")}
								>
									Auctions History
								</button>
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
									onClick={() => navigate("/admin/transactions")}
								>
									Transaction History
								</button>
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded-md"
									onClick={() => navigate("/admin/bids")}
								>
									Bids Placed
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Nav;