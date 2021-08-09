import React, { useState, useMemo } from 'react';
import RequestCard from '../../components/RequestCard/RequestCard';
import styled from 'styled-components';
import TokenInfoSidebar from '../../components/Sidebar/TokenInfo';
import TokenStatsSidebar from '../../components/Sidebar/TokenStats';
import Pagination from '../../components/Pagination';
import maxWidthWrapper from '../../components/Elements/MaxWidth';
import { timeSince, convertToBiobit } from '../../utils';
import homepageBg from '../../assets/home-bg.jpg';
import HomepageCounters from '../../components/HomepageCounters';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';

const RequestsListWrapper = styled.div`
	position: relative;
	width: 100%;
	background: ${(props) => (props.isLoading ? '#F1F6FC' : 'unset')};
`;

const Background = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	z-index: -1;

	&::before {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 80vh;

		background-image: url(${homepageBg}),
			linear-gradient(0deg, rgb(255 255 255), rgb(255 255 255 / 0%));
		background-size: 100%, 400px;
		background-position: 0 -30px;
		z-index: -3;
	}

	&::after {
		content: '';
		display: block;
		position: absolute;
		bottom: 0;
		height: 80vh;
		left: 0;
		width: 100%;
		z-index: -2;
		background: linear-gradient(0deg, rgb(255 255 255) 50%, rgb(255 255 255 / 0%));
	}
`;

const RequestsListLayout = styled.section`
	display: flex;
	flex-direction: row-reverse;
	flex-wrap: nowrap;
	width: 100%;
	padding-top: ${(props) => props.theme.spacing(4)};
	${maxWidthWrapper};
`;

const RequestListSidebarWrapper = styled.aside`
	display: flex;
	flex-wrap: wrap;
	flex-direction: column;
	flex: 0 0 310px;
`;

const RequestsListContentWrapper = styled.section`
	flex: 1 0;
	padding: 0 ${(props) => props.theme.spacing(2)};
`;

const Card = styled.div`
	width: 100%;
	margin-right: 30px;
	height: 320px;
	margin-bottom: 25px;
	background: #fff;
	padding: 30px 33px;
	display: flex;
	flex-direction: row;
`;
const CircleSection = styled.div`
	margin-right: 28px;
`;
const SquerSection = styled.div`
	flex-grow: 1;
`;

const SkeletonSidebarCard = styled.div`
	width: 100%;
	height: 210px;
	background: #fff;
	margin-bottom: 25px;
`;

const useStyles = makeStyles({
	root: {
		marginBottom: '19px',
		background: '#F1F6FC'
	},
});

const Desktop = ({
	requests,
	appState,
	web3React,
	ZarelaReward,
	BiobitBasedOnEth,
	dailyContributors,
	PAGE_SIZE,
	isLoading,
	props,
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const classes = useStyles(props);

	const currentTableData = useMemo(() => {
		const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
		const lastPageIndex = firstPageIndex + PAGE_SIZE;
		return Object.values(requests)
			.sort((a, b) => +b.requestID - +a.requestID)
			.slice(firstPageIndex, lastPageIndex);
	}, [currentPage, requests]);

	return (
		<RequestsListWrapper isLoading={isLoading}>
			{!isLoading && <Background />}
			<HomepageCounters
				zarelaDailyGift={appState.zarelaDailyGift}
				zarelaInitDate={appState.zarelaInitDate}
			/>
			<RequestsListLayout>
				{isLoading ? (
					<RequestListSidebarWrapper>
						{[1,2,3].map(index => {
							return(
								<SkeletonSidebarCard />
							)
						})}
					</RequestListSidebarWrapper>
				) : (
					<RequestListSidebarWrapper>
						<TokenStatsSidebar dailyContributors={dailyContributors} />
						<TokenInfoSidebar data={appState} account={web3React.account} />
					</RequestListSidebarWrapper>
				)}
				<RequestsListContentWrapper>
					{isLoading
						? [1, 2, 3].map((index) => {
								return (
									<Card key={index}>
										<CircleSection>
											<Skeleton variant="circle" width={72} height={72} className={classes.root} className={classes.root} />
										</CircleSection>
										<SquerSection>
											<Skeleton
												variant="rect"
												width={'100%'}
												height={33}
												animation="wave"
												className={classes.root}
											/>
											<Skeleton
												variant="rect"
												width={'33%'}
												height={'33px'}
												className={classes.root}
											/>
										</SquerSection>
									</Card>
								);
						  })
						: currentTableData.map((item) => {
								return (
									<RequestCard
										key={item.requestID}
										requestID={item.requestID}
										title={item.title}
										description={item.description}
										tokenPay={item.tokenPay}
										timestamp={timeSince(item.timestamp)}
										progress={
											(+item.totalContributed / +item.totalContributors) * 100
										}
										contributors={`${item.totalContributed}/${item.totalContributors}`}
										totalContributedCount={item.totalContributedCount}
									/>
								);
						  })}
				</RequestsListContentWrapper>
			</RequestsListLayout>
			<Pagination
				currentPage={currentPage}
				totalCount={Object.values(requests).length}
				pageSize={PAGE_SIZE}
				onPageChange={(page) => setCurrentPage(page)}
			/>
		</RequestsListWrapper>
	);
};

export default Desktop;
