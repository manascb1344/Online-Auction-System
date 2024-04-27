import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Nav = ({ header, socket }) => {
	const [notification, setNotification] = useState("");
	const navigate = useNavigate(); // Initialize useNavigate hook

	useEffect(() => {
		socket.on("addProductResponse", (data) => {
			setNotification(
				`@${data.owner} just added ${data.name} worth $${Number(
					data.price
				).toLocaleString()}`
			);
		});
	}, [socket]);

	useEffect(() => {
		socket.on("bidProductResponse", (data) => {
			setNotification(
				`@${data.last_bidder} just bid ${data.name} for $${Number(
					data.amount
				).toLocaleString()}`
			);
		});
	}, [socket]);

	const handleLogout = () => {
		localStorage.removeItem("seller_id");
		localStorage.removeItem("buyer_id");
		localStorage.removeItem("username");
		localStorage.removeItem("userType");

		// Navigate to /login route upon logout
		navigate("/login");
	};

	return (
		<nav className="navbar flex justify-between items-center px-4 py-2 bg-gray-200">
			<div className="header">
				<h2 className="text-xl font-semibold">{header}</h2>
			</div>

			<div>
				<p className="text-red-500">{notification}</p>
				<button onClick={handleLogout}>Logout</button>
			</div>
		</nav>
	);
};

export default Nav;
