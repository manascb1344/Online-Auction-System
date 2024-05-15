import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
	const [profile, setProfile] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const userId = localStorage.getItem('buyer_id');

		const fetchProfile = async () => {
			try {
				const response = await axios.get(`http://localhost:4000/api/profile/${userId}`);
				setProfile(response.data);
			} catch (error) {
				setError('Error fetching profile. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		if (userId) {
			fetchProfile();
		} else {
			setError('Buyer ID not found in local storage.');
			setLoading(false);
		}
	}, []);

	if (loading) {
		return <div className="text-center mt-4">Loading...</div>;
	}

	if (error) {
		return <div className="text-center mt-4">{error}</div>;
	}

	let formattedAccountBalance = '';
	const accountBalance = Number(profile.Account_Balance);
	if (!isNaN(accountBalance)) {
		formattedAccountBalance = accountBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	} else {
		formattedAccountBalance = 'N/A';
	}

	return (
		<div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-xl font-semibold text-center mb-4">Profile</h2>
			<div className="text-left">
				<p><strong>Username:</strong> {profile.Username}</p>
				<p><strong>Email:</strong> {profile.Email}</p>
				<p><strong>Address:</strong> {profile.Address}</p>
				<p><strong>Account Balance:</strong> ₹{formattedAccountBalance}</p>
			</div>
		</div>
	);
};

export default Profile;
