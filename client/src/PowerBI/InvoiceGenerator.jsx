import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

function InvoiceGenerator() {
	const [buyer, setBuyer] = useState(null);
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchBuyerAndTransactions = async () => {
			try {
				const buyerResponse = await axios.get('http://localhost:3000/buyers/1');
				const transactionsResponse = await axios.get('http://localhost:3000/transactions?buyer_id=1');

				setBuyer(buyerResponse.data);
				setTransactions(transactionsResponse.data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching data:', error);
				setLoading(false);
			}
		};

		fetchBuyerAndTransactions();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	const totalAmount = transactions.reduce((acc, curr) => acc + curr.Transaction_Amount, 0);

	const styles = StyleSheet.create({
		page: {
			flexDirection: 'column',
			padding: 20,
		},
		section: {
			marginBottom: 10,
		},
		header: {
			fontSize: 20,
			fontWeight: 'bold',
			marginBottom: 10,
		},
		row: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginBottom: 5,
		},
		label: {
			fontWeight: 'bold',
		},
		total: {
			marginTop: 10,
			fontWeight: 'bold',
		},
	});

	const InvoiceDocument = (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.section}>
					<Text style={styles.header}>Invoice for {buyer && buyer.Username}</Text>
					<View style={styles.row}>
						<Text style={styles.label}>Email:</Text>
						<Text>{buyer && buyer.Email}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Address:</Text>
						<Text>{buyer && buyer.Address}</Text>
					</View>
				</View>
				<View style={styles.section}>
					<Text style={styles.header}>Transaction Details</Text>
					<table>
						<thead>
							<tr>
								<th>Item Name</th>
								<th>Transaction Amount</th>
								<th>Transaction Time</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map(transaction => (
								<tr key={transaction.Transaction_ID}>
									<td>{transaction.Item_Name}</td>
									<td>{transaction.Transaction_Amount}</td>
									<td>{transaction.Transaction_Time}</td>
								</tr>
							))}
						</tbody>
					</table>
				</View>
				<View style={styles.section}>
					<Text style={styles.total}>Total Amount: ${totalAmount.toFixed(2)}</Text>
				</View>
			</Page>
		</Document>
	);

	return (
		<PDFViewer style={{ width: '100%', height: '100vh' }}>
			{InvoiceDocument}
		</PDFViewer>
	);
}

export default InvoiceGenerator;
