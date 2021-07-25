import styled, { css } from 'styled-components';
import Button from '../../../Elements/Button';

export const QRCode = styled.div`
	width: 161px;
	height: 153px;
	display: flex;
	margin: 25px 0;
	justify-content: center;
	align-items: center;
	box-shadow: 0px 4px 18px rgb(17 94 89 / 12%);
    border-radius: 4px;
	margin-bottom: ${props => props.theme.spacing(2)};
`;

export const QRCodeImage = styled.img`
`;

export const customButton = css`
	height: 40px;
	width: 160px;
	margin: 0;

	& > * {
		font-weight: 500;
		font-size: 16.4px;
		line-height: 33px;
		padding: 0;
	}
`;

export const SaveQRCodeButton = styled(Button)`
	${customButton};
`;

export const AddressTitle = styled.div`
	font-weight: 500;
	font-size: 18px;
	line-height: 23px;
	margin-bottom: ${props => props.theme.spacing(1)};
	`;
export const Address = styled.div`
	font-size: 16px;
	font-weight: 400px;
	line-height: 28px;
	text-align: center;
	margin-bottom: ${props => props.theme.spacing(3.5)};
	width: 240px;
    word-break: break-word;
`;

export const CopyAddressButton = styled(Button)`
	${customButton};
`;