import React, { useEffect, useState } from "react";
import EditButton from "./EditButton";
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
				const activeProducts = data.items.filter(product => product.Auction_Status === 'Active' && new Date(product.Auction_End_Time) > new Date());
				setProducts(activeProducts);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching products:", error);
				setError(error.message);
				setLoading(false);
			}
		};

		const pollingInterval = setInterval(fetchProducts, 1000);

		fetchProducts();

		return () => {
			clearInterval(pollingInterval);
		};
	}, []);

	const displayCountdown = (endTime) => {
		const now = new Date();
		const end = new Date(endTime);
		const diff = end - now;
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
		if (diff <= 900000) {
			return <span style={{ color: "red" }}>{`${days}d ${hours}h ${minutes}m ${seconds}s`}</span>;
		} else {
			return `${days}d ${hours}h ${minutes}m ${seconds}s`;
		}

	};

	const indexOfLastProduct = currentPage * productsPerPage;
	const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

	const currentProducts = products ? products.slice(indexOfFirstProduct, indexOfLastProduct) : [];

	const calculateCountdown = (endTime) => {
		const now = new Date();
		const end = new Date(endTime);
		const diff = end - now;
		return diff;
	};
	currentProducts.sort((a, b) => calculateCountdown(a.Auction_End_Time) - calculateCountdown(b.Auction_End_Time));


	const nextPage = () => setCurrentPage(currentPage + 1);
	const prevPage = () => setCurrentPage(currentPage - 1);

	return (
		<div className="font-poppins min-h-screen bg-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center mb-8">
					<h2 className="text-2xl font-semibold text-gray-800 pt-5">Product List</h2>
				</div>

				<div className="overflow-x-auto shadow-md rounded-lg">
					<table className="w-full table-auto border-collapse">
						<thead>
							<tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
								<th className="py-3 px-6 text-left">Title</th>
								<th className="py-3 px-6 text-left">Base Price</th>
								<th className="py-3 px-6 text-left">Last Bidder</th>
								<th className="py-3 px-6 text-left">Seller</th>
								<th className="py-3 px-6 text-left">Last Bid</th>
								<th className="py-3 px-6 text-left">Countdown</th>
								<th className="py-3 px-6 text-left">Action</th>
							</tr>
						</thead>
						<tbody className="text-gray-600 text-sm font-light">
							{loading ? (
								<tr>
									<td colSpan="7" className="py-4 px-6 text-center">
										Loading...
									</td>
								</tr>
							) : error ? (
								<tr>
									<td colSpan="7" className="py-4 px-6 text-center">
										Error: {error}
									</td>
								</tr>
							) : (
								currentProducts.map((product, index) => (
									<tr
										key={index}
										className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
									>
										<td className="py-4 px-6 border-b border-gray-200">
											{product.Item_Name}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{product.Starting_Price}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{product.Last_Bidder || "None"}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{product.Seller_Username}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{product.Last_Bid || product.Starting_Price}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{displayCountdown(product.Auction_End_Time)}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											<EditButton product={product} />
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				<div className="flex justify-center mt-4">
					<button
						className="px-3 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 mr-2 focus:outline-none"
						onClick={prevPage}
						disabled={currentPage === 1}
					>
						<FiChevronLeft />
					</button>
					<span className="px-3 py-1 rounded bg-gray-200 text-gray-600 mr-2">
						{currentPage}
					</span>
					<button
						className="px-3 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none"
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
