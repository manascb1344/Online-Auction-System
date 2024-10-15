import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ViewProducts = () => {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [productsPerPage] = useState(15);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const sellerID = localStorage.getItem("seller_id");
				console.log("Fetching products for seller ID:", sellerID);
				const response = await fetch(`http://localhost:4000/api/seller/products/${sellerID}`);
				if (!response.ok) {
					throw new Error("Failed to fetch products");
				}
				const data = await response.json();
				console.log("Fetched data:", data);
				setProducts(data);
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

	const indexOfLastProduct = currentPage * productsPerPage;
	const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
	const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

	console.log("Current products:", currentProducts);

	const nextPage = () => setCurrentPage(currentPage + 1);
	const prevPage = () => setCurrentPage(currentPage - 1);

	return (
		<div className="font-poppins">
			<div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center mb-8">
					<h2 className="text-2xl font-semibold">Product List</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="w-95p table-auto border border-gray-700 mx-auto border-collapse">
						<thead>
							<tr className="bg-gray-200">
								<th className="px-4 py-2 text-left border border-gray-700">Product ID</th>
								<th className="px-4 py-2 text-left border border-gray-700">Seller ID</th>
								<th className="px-4 py-2 text-left border border-gray-700">Product Name</th>
								<th className="px-4 py-2 text-left border border-gray-700">Description</th>
								<th className="px-4 py-2 text-left border border-gray-700">Starting Price</th>
								<th className="px-4 py-2 text-left border border-gray-700">Auction End Time</th>
								<th className="px-4 py-2 text-left border border-gray-700">Category</th>
								<th className="px-4 py-2 text-left border border-gray-700">Last Bidder</th>
								<th className="px-4 py-2 text-left border border-gray-700">Last Bid</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan="9">Loading...</td>
								</tr>
							) : error ? (
								<tr>
									<td colSpan="9">Error: {error}</td>
								</tr>
							) : currentProducts.length === 0 ? (
								<tr>
									<td colSpan="9">No products found</td>
								</tr>
							) : (
								currentProducts.map((product) => {
									console.log("Rendering product:", product);
									return (
										<tr key={`${product.item_id}-${product.seller_id}`}>
											<td className="px-4 py-2 border border-gray-700">{product.item_id}</td>
											<td className="px-4 py-2 border border-gray-700">{product.seller_id}</td>
											<td className="px-4 py-2 border border-gray-700">{product.item_name}</td>
											<td className="px-4 py-2 border border-gray-700">{product.description}</td>
											<td className="px-4 py-2 border border-gray-700">{product.starting_price}</td>
											<td className="px-4 py-2 border border-gray-700">{product.auction_end_time}</td>
											<td className="px-4 py-2 border border-gray-700">{product.category}</td>
											<td className="px-4 py-2 border border-gray-700">{product.last_bidder || "None"}</td>
											<td className="px-4 py-2 border border-gray-700">{product.last_bid || "None"}</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
				<div className="flex justify-center mt-4">
					<button
						className="px-3 py-1 rounded bg-gray-100 mr-2"
						onClick={prevPage}
						disabled={currentPage === 1}
					>
						<FiChevronLeft />
					</button>
					<span className="px-3 py-1 rounded bg-gray-100 mr-2">
						{currentPage}
					</span>
					<button
						className="px-3 py-1 rounded bg-gray-100"
						onClick={nextPage}
						disabled={currentProducts.length < productsPerPage}
					>
						<FiChevronRight />
					</button>
				</div>
			</div>
		</div>
	);
};

export default ViewProducts;
