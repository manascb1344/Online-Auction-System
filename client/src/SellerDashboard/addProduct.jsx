import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddsellerProd = () => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState(0);
	const [endTime, setEndTime] = useState("");
	const [auctionStartTime, setAuctionStartTime] = useState("");
	const [category, setCategory] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const sellerID = localStorage.getItem("seller_id");
			const response = await axios.post("http://localhost:4000/api/addProduct", {
				itemName: name,
				description: description,
				startingPrice: price,
				auctionStartTime: auctionStartTime,
				auctionEndTime: endTime,
				category: category,
				sellerID: sellerID,
			});
			if (response.status === 200) {
				navigate("/seller/products");
			} else {
				console.error("Failed to add product");
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	return (
		<div className="font-poppins">
			<div className="w-full flex flex-col items-center">
				<h2 className="mb-8 text-2xl">Add a new product</h2>
				<form className="w-80 flex flex-col items-center" onSubmit={handleSubmit}>
					<label htmlFor="name" className="mb-2">
						Name of the product
					</label>
					<input
						type="text"
						name="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="w-full px-4 py-2 rounded border border-gray-300 mb-4 outline-none"
					/>

					<label htmlFor="description" className="mb-2">
						Description
					</label>
					<textarea
						name="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						required
						className="w-full px-4 py-2 rounded border border-gray-300 mb-4 outline-none"
					></textarea>

					<label htmlFor="price" className="mb-2">
						Starting price
					</label>
					<input
						type="number"
						name="price"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						required
						className="w-full px-4 py-2 rounded border border-gray-300 mb-4 outline-none"
					/>

					<label htmlFor="auctionStartTime" className="mb-2">
						Auction Start Time
					</label>
					<input
						type="datetime-local"
						name="auctionStartTime"
						value={auctionStartTime}
						onChange={(e) => setAuctionStartTime(e.target.value)}
						required
						className="w-full px-4 py-2 rounded border border-gray-300 mb-4 outline-none"
					/>

					<label htmlFor="endTime" className="mb-2">
						Auction End Time
					</label>
					<input
						type="datetime-local"
						name="endTime"
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						required
						className="w-full px-4 py-2 rounded border border-gray-300 mb-4 outline-none"
					/>

					<label htmlFor="category" className="mb-2">
						Category
					</label>
					<input
						type="text"
						name="category"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
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

export default AddsellerProd;
