import React, { useEffect, useState } from "react";
import EditButton from "./EditButton";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Products = () => {
	const [products, setProducts] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [productsPerPage] = useState(15);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await fetch("http://localhost:4000/api");
				if (!response.ok) {
					throw new Error("Failed to fetch products");
				}
				const data = await response.json();
				setProducts(data.items);
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

	// Get current products
	const indexOfLastProduct = currentPage * productsPerPage;
	const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
	const currentProducts = products
		? products.slice(indexOfFirstProduct, indexOfLastProduct)
		: [];

	// Change page
	const nextPage = () => setCurrentPage(currentPage + 1);
	const prevPage = () => setCurrentPage(currentPage - 1);

	return (
		<div className="font-poppins">
			<div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center mb-8">
					<h2 className="text-2xl font-semibold">Product List</h2>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full table-auto border-collapse">
						<thead>
							<tr className="bg-gray-200">
								<th className="px-4 py-2 text-left">Title</th>
								<th className="px-4 py-2 text-left">Price</th>
								<th className="px-4 py-2 text-left">Last Bidder</th>
								<th className="px-4 py-2 text-left">Seller</th>
								<th className="px-4 py-2 text-left">Last Bid</th>
								<th className="px-4 py-2 text-left">Action</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan="6">Loading...</td>
								</tr>
							) : error ? (
								<tr>
									<td colSpan="6">Error: {error}</td>
								</tr>
							) : (
								currentProducts.map((product, index) => (
									<tr
										key={index}
										className={index % 2 === 0 ? "bg-gray-100" : ""}
									>
										<td className="px-4 py-2">
											{product.Item_Name}
										</td>
										<td className="px-4 py-2">
											{product.Starting_Price}
										</td>
										<td className="px-4 py-2">
											{product.Last_Bidder || "None"}
										</td>
										<td className="px-4 py-2">
											{product.Seller_Username}
										</td>
										<td className="px-4 py-2">
											{product.Last_Bid || product.Starting_Price}
										</td>
										<td className="px-4 py-2">
											<EditButton product={product} />
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				{/* Pagination */}
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

export default Products;
