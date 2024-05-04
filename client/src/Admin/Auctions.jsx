import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Auctions = () => {
	const [auctions, setAuctions] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [auctionsPerPage] = useState(15);

	useEffect(() => {
		const fetchAuctions = async () => {
			try {
				const response = await fetch("http://localhost:4000/api/auctions");
				if (!response.ok) {
					throw new Error("Failed to fetch Auctions");
				}
				const data = await response.json();
				setAuctions(data.items);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching Auctions:", error);
				setError(error.message);
				setLoading(false);
			}
		};

		const pollingInterval = setInterval(fetchAuctions, 5000);

		fetchAuctions();

		return () => {
			clearInterval(pollingInterval);
		};
	}, []);

	const indexOfLastAuction = currentPage * auctionsPerPage;
	const indexOfFirstAuction = indexOfLastAuction - auctionsPerPage;
	const currentAuctions = auctions
		? auctions.slice(indexOfFirstAuction, indexOfLastAuction)
		: [];

	const nextPage = () => setCurrentPage(currentPage + 1);
	const prevPage = () => setCurrentPage(currentPage - 1);

	return (
		<div className="font-poppins min-h-screen bg-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center mb-8">
					<h2 className="text-2xl font-semibold text-gray-800 pt-5">Auctions History</h2>
				</div>

				<div className="overflow-x-auto shadow-md rounded-lg">
					<table className="w-full table-auto border-collapse">
						<thead>
							<tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
								<th className="py-3 px-6 text-left">ID</th>
								<th className="py-3 px-6 text-left">Item Name</th>
								<th className="py-3 px-6 text-left">Description</th>
								<th className="py-3 px-6 text-left">Start Time</th>
								<th className="py-3 px-6 text-left">End Time</th>
								<th className="py-3 px-6 text-left">Status</th>
								<th className="py-3 px-6 text-left">Reserve Price</th>
							</tr>
						</thead>
						<tbody className="text-gray-600 text-sm font-light">
							{loading ? (
								<tr>
									<td colSpan="6" className="py-4 px-6 text-center">
										Loading...
									</td>
								</tr>
							) : error ? (
								<tr>
									<td colSpan="6" className="py-4 px-6 text-center">
										Error: {error}
									</td>
								</tr>
							) : (
								currentAuctions.map((auction, index) => (
									<tr
										key={index}
										className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
									>
										<td className="py-4 px-6 border-b border-gray-200">
											{auction.Auction_ID}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{auction.Item_Name}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{auction.Description}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{auction.Auction_Start_Time}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{auction.Auction_End_Time}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{auction.Auction_Status}
										</td>
										<td className="py-4 px-6 border-b border-gray-200">
											{auction.Reserve_Price}
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
						disabled={currentAuctions.length < auctionsPerPage}
					>
						<FiChevronRight />
					</button>
				</div>
			</div>
		</div>
	);
};

export default Auctions;