import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
	return (
		<div className="text-center p-8">
			<h1 className="text-3xl font-bold mb-8">
			    Admin Dashboard
			</h1>
			<div className="flex justify-center mb-4">
				<Link to="/admin/auctions" className="mr-4">
					<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						Auctions History
					</button>
				</Link>
				<Link to="/admin/transactions" className="mr-4">
					<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						Transaction History
					</button>
				</Link>
                <Link to="/admin/bids">
					<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						Bids Placed
					</button>
				</Link>
			</div>
		</div>
	);
};

export default AdminDashboard;
