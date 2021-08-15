import React, { useContext } from 'react';
import styled from 'styled-components';
import RequestCardWrapper, {
	Footer,
	HeaderLayout,
	RequestNumber,
	Typography,
	Title,
	Spacer,
	Divider,
	Description,
	Timestamp,
	ContributorBadge,
	ContributorsIcon,
	BadgeRow,
	TokenIcon,
	TokenValue,
	JoinButton,
	ProgressTrackerWrapper,
	ProgressTrackerTrack,
	ProgressTrackerProcess,
	BadgeLabel,
} from '../Elements/RequestCard/IndexMobile';
import { TagsWrapper, TagItem } from '../Elements/RequestCard';
import biobitIcon from '../../assets/icons/biobit-black.svg';
import contributorIcon from '../../assets/icons/user-black.svg';
import documentsIcon from '../../assets/icons/document-black.svg';
import { mainContext } from '../../state';

const BiobitToDollarValue = styled.div`
	position: absolute;
	bottom: -5px;
	left: 1px;
	font-weight: 600;
	font-size: 9.5px;
	line-height: 0px;
	color: #3a68de;
	margin-right: 2px;
	margin-left: 8px;
	white-space: nowrap;
	margin-left: ${(props) => (props.noMargin ? props.theme.spacing(1) : props.theme.spacing(0.8))};
	white-space: nowrap;
`;

const BiobitToDollarPair = styled.div`
	position: relative;
	bottom: 0;
	padding-right: 9px;
	display: flex;
	flex-direction: column;
	align-items: center;
	align-self: self-start;
	width: fit-content;
`;

const RequestCardMobile = (props) => {
	const { appState } = useContext(mainContext);

	return (
		<RequestCardWrapper>
			<HeaderLayout>
				<RequestNumber isMobile={appState.isMobile}>{props.requestID}</RequestNumber>
				<Title>{props.title.length < 70 ? props.title : props.title.substr(0, 70) + '...'}</Title>
				<Spacer />
			</HeaderLayout>
			<Timestamp nowrap variant="caption">
				{props.timestamp}
			</Timestamp>
			<Description>
				<Typography variant="body">
					{props.description.length < 120 ? props.description : props.description.substr(0, 120) + '...'}
				</Typography>
				<TagsWrapper>
					{props.categories.split(',').map((item, index) => {
						return <TagItem key={index}>#{item}</TagItem>;
					})}
				</TagsWrapper>
			</Description>
			<ProgressTrackerWrapper>
				<ProgressTrackerTrack>
					<ProgressTrackerProcess progress={props.progress} />
				</ProgressTrackerTrack>
			</ProgressTrackerWrapper>
			<Footer>
				<BiobitToDollarPair>
					<BadgeRow>
						<TokenIcon src={biobitIcon} />
						<TokenValue>{props.tokenPay}</TokenValue>
					</BadgeRow>
					<BadgeRow>
						<BiobitToDollarValue>{`~ $ ${props.tokenPay}`}</BiobitToDollarValue>
					</BadgeRow>
				</BiobitToDollarPair>
				<Divider />
				<ContributorBadge>
					<BadgeRow>
						<ContributorsIcon src={documentsIcon} />
						<BadgeLabel>{props.contributors}</BadgeLabel>
					</BadgeRow>
				</ContributorBadge>
				<Divider />
				<ContributorBadge>
					<BadgeRow>
						<ContributorsIcon src={contributorIcon} />
						<BadgeLabel>{props.totalContributedCount}</BadgeLabel>
					</BadgeRow>
				</ContributorBadge>
				<JoinButton variant="secondary" to={`/request/${props.requestID}`}>
					Start
				</JoinButton>
			</Footer>
		</RequestCardWrapper>
	);
};

export default RequestCardMobile;