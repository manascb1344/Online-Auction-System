import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
	const [userName, setUserName] = useState("");
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		localStorage.setItem("userName", userName);
		navigate("/products");
	};

	return (
		<div className="font-poppins">
			<form
				className="w-full flex flex-col items-center"
				onSubmit={handleSubmit}
			>
				<label htmlFor="username" className="mb-2">
					Enter your username
				</label>
				<input
					type="text"
					name="username"
					value={userName}
					onChange={(e) => setUserName(e.target.value)}
					required
					minLength={6}
					className="w-80 px-4 py-2 rounded border border-gray-300 mb-4 outline-none"
				/>
				<button className="w-40 px-4 py-2 text-white text-lg bg-green-500 rounded cursor-pointer">
					SIGN IN
				</button>
			</form>
		</div>
	);
};

export default Home;
