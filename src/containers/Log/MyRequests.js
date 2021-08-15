import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { mainContext } from '../../state';
import { convertToBiobit } from '../../utils';
import Spinner from '../../components/Spinner';
import MyRequest from '../../components/LogCards/MyRequest';
import MyRequestMobile from '../../components/LogCards/MyRequestMobile';
import NoRequestsFound from '../../components/NoRequestsFound';
import { useWeb3React } from '@web3-react/core';

const SpinnerWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: ${(props) => props.theme.spacing(3)};
`;

const MyRequests = () => {
	const { account } = useWeb3React();
	const { appState } = useContext(mainContext);
	const [requests, setRequests] = useState([]);
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		if (appState.contract !== null) {
			if (account) {
				setLoading(true);
				appState.contract.methods
					.orderResult()
					.call({ from: account })
					.then((result) => {
						const userContributionsSet = new Set(result[0]);
						const userContributions = [...userContributionsSet];

						const getAllRequests = new Promise(async (resolve, reject) => {
							const requests = [];
							try {
								for (const currentRequest of userContributions) {
									let requestInfo = await appState.contract.methods.orders(currentRequest).call();

									const requestTemplate = {
										requestID: requestInfo[0],
										title: requestInfo[1],
										description: requestInfo[6],
										requesterAddress: requestInfo[2],
										tokenPay: convertToBiobit(requestInfo[3]),
										totalContributors: requestInfo[4],
										totalContributed: +requestInfo[4] - +requestInfo[7],
										whitePaper: requestInfo[5],
										timestamp: requestInfo[9],
										totalContributedCount: requestInfo[8],
									};
									requests.push(requestTemplate);
								}
								resolve(requests);
							} catch (error) {
								console.error(error.message);
								reject(error.message);
							}
						});

						getAllRequests.then((requestsList) => {
							console.log('requestsList', requestsList);
							setRequests(requestsList);
							setLoading(false);
						});
					})
					.catch((error) => {
						console.error(error.message);
					});
			}
		}
	}, [appState.contract, account]);

	if (appState.isMobile)
		return isLoading ? (
			<SpinnerWrapper>
				<Spinner />
			</SpinnerWrapper>
		) : requests.length === 0 ? (
			<NoRequestsFound />
		) : (
			requests.map((request) => <MyRequestMobile key={request.requestID} data={request} />)
		);
	return isLoading ? (
		<SpinnerWrapper>
			<Spinner />
		</SpinnerWrapper>
	) : requests.length === 0 ? (
		<NoRequestsFound />
	) : (
		requests.map((request) => <MyRequest key={request.requestID} data={request} />)
	);
};

export default MyRequests;