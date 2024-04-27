import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewProducts = () => {
	const [products, setProducts] = useState([]);

	useEffect(() => {
		// Fetch products from backend API
		const fetchProducts = async () => {
			try {
				const response = await axios.get("/api/seller/products");
				setProducts(response.data.products);
			} catch (error) {
				console.error("Error fetching products:", error);
			}
		};
		fetchProducts();
	}, []);

	return (
		<div>
			<h2>My Products</h2>
			<ul>
				{products.map((product) => (
					<li key={product.Item_ID}>{product.Item_Name}</li>
				))}
			</ul>
		</div>
	);
};

export default ViewProducts;
