import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";

const NotFound = () => {
	const [animationData, setAnimationData] = useState(null);

	useEffect(() => {
		const fetchAnimationData = async () => {
			try {
				const response = await fetch("https://lottie.host/fc397bc2-2e88-41d3-a221-1c6710a0b3d1/lTapGNSBgj.json");
				const data = await response.json();
				setAnimationData(data);
			} catch (error) {
				console.error("Error fetching animation data:", error);
			}
		};

		fetchAnimationData();
	}, []);

	const defaultOptions = {
		loop: true,
		autoplay: true,
		animationData: animationData,
		rendererSettings: {
			preserveAspectRatio: "xMidYMid slice"
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "0 20px" }}>
			<h2 style={{ fontWeight: "bold", fontSize: "clamp(24px, 5vw, 36px)", marginBottom: "1rem" }}>404 Not Found</h2>
			<p style={{ fontWeight: "normal", fontSize: "clamp(16px, 4vw, 24px)", marginBottom: "2rem", textAlign: "center" }}>The page you are looking for does not exist.</p>
			{animationData && (
				<div style={{ width: "100%", maxWidth: "400px" }}>
					<Lottie options={defaultOptions} />
				</div>
			)}
		</div>
	);
};

export default NotFound;
