import React from "react";
import { Link } from "react-router-dom";

// Reusable ButtonLink component
const ButtonLink = ({ to, text }) => {
  return (
    <Link to={to} className="mr-4">
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        {text}
      </button>
    </Link>
  );
};

const AdminDashboard = () => {
  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="flex justify-center mb-4">
        <ButtonLink to="/admin/auctions" text="Auctions History" />
        <ButtonLink to="/admin/transactions" text="Transaction History" />
        <ButtonLink to="/admin/bids" text="Bids Placed" />
      </div>
    </div>
  );
};

export default AdminDashboard;
