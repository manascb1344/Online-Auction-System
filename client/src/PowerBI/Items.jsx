import React from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

const Items = () => {
	return (
		<div>
			<PowerBIEmbed
				embedConfig={{
					type: 'report', // Supported types: report, dashboard, tile, visual, and qna
					id: 'a7ab29a3-02c7-4c45-81a8-e756e9897d79',
					embedUrl: "https://app.powerbi.com/reportEmbed?reportId=a7ab29a3-02c7-4c45-81a8-e756e9897d79&groupId=80341867-c2f8-41d8-8c92-ed42fd7dccc2&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVdFU1QtRVVST1BFLUItUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImVtYmVkRmVhdHVyZXMiOnsibW9kZXJuRW1iZWQiOnRydWV9fQ%3d%3d",
					accessToken: 'YOUR_ACCESS_TOKEN_HERE',
					tokenType: models.TokenType.Embed,
					settings: {
						panes: {
							filters: {
								expanded: false,
								visible: true
							}
						}
					}
				}}
				eventHandlers={new Map([
					['loaded', () => { console.log('Report loaded'); }],
					['rendered', () => { console.log('Report rendered'); }],
					['error', (event) => { console.log(event.detail); }]
				])}
				cssClassName={"Embed-container"}
				getEmbeddedComponent={(embeddedReport) => {
					window.report = embeddedReport;
				}}
			/>
		</div>
	);
};

export default Items;
