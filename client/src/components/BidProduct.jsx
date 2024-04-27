import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BidProduct = ({ socket }) => {
	const { name, price } = useParams();
	const [amount, setAmount] = useState(price);
	const navigate = useNavigate();
	const [error, setError] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (amount > Number(price)) {
			socket.emit("bidProduct", {
				amount,
				last_bidder: localStorage.getItem("userName"),
				name,
			});
			navigate("/products");
		} else {
			setError(true);
		}
	};

	return (
		<div className="font-poppins">
			<div className="w-full flex flex-col items-center">
				<h2 className="mb-8 text-2xl">Place a Bid</h2>
				<form
					className="w-80 flex flex-col items-center"
					onSubmit={handleSubmit}
				>
					<h3 className="mb-4 text-lg">{name}</h3>

					<label htmlFor="amount" className="mb-2">
						Bidding Amount
					</label>
					{error && (
						<p className="text-red-500 mb-4">
							The bidding amount must be greater than {price}
						</p>
					)}
					<input
						type="number"
						name="amount"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						required
						className="w-full px-4 py-2 rounded border border-gray-300 mb-4 outline-none"
					/>

					<button className="w-40 px-4 py-2 text-white text-lg bg-green-500 rounded cursor-pointer">
						SEND
					</button>
				</form>
			</div>
		</div>
	);
};

export default BidProduct;
