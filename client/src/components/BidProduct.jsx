import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BidProduct = () => {
	const { name, price } = useParams();
	console.log(name, price, localStorage.getItem("username"));
	const [amount, setAmount] = useState(price);
	const navigate = useNavigate();
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const parsedAmount = parseFloat(amount);
			if (parsedAmount <= parseFloat(price)) {
				setError(true);
				setErrorMessage(`The bidding amount must be greater than ${price}`);
				return;
			}

			const response = await axios.post("http://localhost:4000/api/bid", {
				itemName: name,
				amount: parsedAmount,
				last_bidder: localStorage.getItem("username"),
			});

			if (response.data.message === "Bid placed successfully") {
				setError(false);
				navigate("/products");
			} else {
				setError(true);
				setErrorMessage("Failed to place bid. Please try again.");
			}
		} catch (error) {
			console.error("Error placing bid:", error);
			setError(true);
			setErrorMessage("An unexpected error occurred. Please try again later.");
		}
	};

	return (
		<div className="font-poppins">
			<div className="w-full flex flex-col items-center">
				<h2 className="mb-8 text-2xl">Place a Bid</h2>
				<form className="w-80 flex flex-col items-center" onSubmit={handleSubmit}>
					<h3 className="mb-4 text-lg">{name}</h3>
					{error && <p className="text-red-500 mb-4">{errorMessage}</p>}
					<label htmlFor="amount" className="mb-2">
						Bidding Amount
					</label>
					<input
						type="number"
						name="amount"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						min={parseFloat(price) + 0.01}
						step="0.01"
						required
						className="w-full px-4 py-2 rounded border border-gray-300 mb-4 outline-none"
					/>
					<button type="submit" className="w-40 px-4 py-2 text-white text-lg bg-green-500 rounded cursor-pointer">
						SEND
					</button>
				</form>
			</div>
		</div>
	);
};

export default BidProduct;
