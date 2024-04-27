import React, { useEffect, useState } from "react";
import EditButton from "./EditButton";
import { Link } from "react-router-dom";

const Products = () => {
	const [products, setProducts] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await fetch("http://localhost:4000/api");
				if (!response.ok) {
					throw new Error("Failed to fetch products");
				}
				const data = await response.json();
				setProducts(data.items);
				console.log("Products:", data.items);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching products:", error);
				setError(error.message);
				setLoading(false);
			}
		};

		const pollingInterval = setInterval(fetchProducts, 5000);

		fetchProducts();

		return () => {
			clearInterval(pollingInterval);
		};
	}, []);

	return (
		<div>
			<div className="table__container">
				<Link to="/products/add" className="products__cta">
					ADD PRODUCTS
				</Link>

				<table>
					<thead>
						<tr>
							<th>Title</th>
							<th>Price</th>
							<th>Last Bidder</th>
							<th>Seller</th>
							<th>Bid</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan="5">Loading...</td>
							</tr>
						) : error ? (
							<tr>
								<td colSpan="5">Error: {error}</td>
							</tr>
						) : (
							products.map((product, index) => (
								<tr key={index}>
									<td>{product.Item_Name}</td>
									<td>{product.Starting_Price}</td>
									<td>{product.last_bidder || "None"}</td>
									<td>{product.Seller_Username}</td>
									<td>
										<EditButton product={product} />
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Products;
