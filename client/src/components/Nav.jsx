import React, { useState, useEffect } from "react";

const Nav = ({ header, socket }) => {
	const [notification, setNotification] = useState("");

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

	return (
		<nav className="navbar flex justify-between items-center px-4 py-2 bg-gray-200">
			<div className="header">
				<h2 className="text-xl font-semibold">{header}</h2>
			</div>

			<div>
				<p className="text-red-500">{notification}</p>
			</div>
		</nav>
	);
};

export default Nav;
