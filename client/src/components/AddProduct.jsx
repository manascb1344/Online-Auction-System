import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProduct = ({ socket }) => {
	const [name, setName] = useState("");
	const [price, setPrice] = useState(0);
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		socket.emit("addProduct", {
			name,
			price,
			owner: localStorage.getItem("userName"),
		});
		navigate("/products");
	};

	return (
		<div className="font-poppins">
			<div className="w-full flex flex-col items-center">
				<h2 className="mb-8 text-2xl">Add a new product</h2>
				<form
					className="w-80 flex flex-col items-center"
					onSubmit={handleSubmit}
				>
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

					<button className="w-40 px-4 py-2 text-white text-lg bg-green-500 rounded cursor-pointer">
						SEND
					</button>
				</form>
			</div>
		</div>
	);
};

export default AddProduct;
