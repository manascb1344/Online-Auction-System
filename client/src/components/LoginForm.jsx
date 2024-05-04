import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [userType, setUserType] = useState("buyer");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post(
				"http://localhost:4000/api/login",
				{
					username,
					password,
					userType,
				}
			);
			if (response.data.auth) {
				console.log("Login successful");
				localStorage.setItem("username", username);
				localStorage.setItem("userType", userType);
				if (userType === "buyer") {
					localStorage.removeItem("seller_id");
					localStorage.setItem("buyer_id", response.data.buyerID);
					navigate("/products");
				} else if (userType === "seller") {
					localStorage.removeItem("buyer_id");
					localStorage.setItem("seller_id", response.data.sellerID);
					navigate("/seller");
				}
			} else {
				setError("Invalid username or password.");
			}
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to login. Please try again later.");
		}
	};

	return (
		<div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
			<div className="p-8">
				<h2 className="text-2xl font-bold mb-4">Login</h2>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<form onSubmit={handleLogin}>
					<input
						className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<select
						className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
						value={userType}
						onChange={(e) => setUserType(e.target.value)}
					>
						<option value="buyer">Buyer</option>
						<option value="seller">Seller</option>
						<option value="admin">Admin</option>
					</select>
					<button
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						type="submit"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
};

export default LoginForm;
