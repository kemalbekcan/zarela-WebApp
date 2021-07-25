import React, { useContext } from 'react';
import styled from 'styled-components';
import { mainContext } from '../../../state';
import {
	Title, TokenList, TokenButton, TokenIcon, TokenName, Token
} from './WalletDeposit/DepositChoices';
import { Content, Row, Column } from './WalletDeposit/Layout';
import biobitIcon from '../../../assets/icons/biobit-black.svg';
import etherIcon from '../../../assets/icons/ether-black.png';
import Textfield from './../../Elements/TextField';
import Button from './../../Elements/Button';
import copyImage from '../../../assets/icons/copy.svg';
import { CopyableText, scientificToDecimal, toast, convertToBiobit } from '../../../utils';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useHistory } from 'react-router';
import { useWeb3React } from '@web3-react/core'


const WalletInput = styled(Textfield)`
	margin-bottom: ${props => props.theme.spacing(4)};
	width: 100%;
`;

const CopyIcon = styled.img`

`;

const SendButton = styled(Button)`
	align-self: flex-end;
    margin: auto;
`;

const Wrapper = styled.form`
padding: 18px;
`;
const TitleLeft = styled(Title)`
	text-align: left;
	margin: unset;
	margin-bottom: ${props => props.theme.spacing(2)}
`;

/* #todo #fancy if the requested amount is more than user balance, give error */
const WalletSendAssets = () => {
	const { appState } = useContext(mainContext);
	const history = useHistory();
	const { account } = useWeb3React();
	const formik = useFormik({
		initialValues: {
			token: 'Biobit',
			address: '',
			amount: ''
		},
		validationSchema: yup.object().shape({
			token: yup.string().required('token type can not be blank'),
			address: yup.string().required('recipient address can not be empty'),
			amount: yup.string().required('token amount can not be empty')
		}),
		onSubmit: (values) => {
			if (values.token === 'Biobit') {
				appState.contract.methods.transfer(values.address, +values.amount * Math.pow(10, 9))
					.send({ from: account }, (error, result) => {
						if (!error) {
							toast(result, 'success', true, result);
							history.push('/wallet/transactions');
							//#todo create the tab based routes
						}
						else {
							toast(error.message, 'error');
						}
					});
			} else {
				appState.fallbackWeb3Instance.eth.sendTransaction({ to: values.address, from: account, value: appState.fallbackWeb3Instance.utils.toWei(values.amount, "ether") })
					.then(({ transactionHash }) => {
						console.log(transactionHash);
					}).catch(error => {
						console.error(error.message);
					});
			}
		}
	});

	const getBalanceHint = () => {
		return `Available: ${formik.values.token === 'Biobit' ? convertToBiobit(+appState.biobitBalance) : +appState.etherBalance} ${formik.values.token === 'Biobit' ? 'BBIT' : 'ETH'}`;
	};

	return (
		<Wrapper onSubmit={formik.handleSubmit}>
			<Content>
				<Column>
					<TokenList>
						<Token >
							<TokenIcon src={biobitIcon} />
							<TokenName>
								BBit
							</TokenName>
						</Token>
					</TokenList>
					<WalletInput
						label={'Address'}
						placeholder={'Please enter the wallet address'}
						adornment={<img src={copyImage} />} // #todo
						onChange={(e) => formik.setFieldValue('address', e.target.value)}
						name='address'
						value={formik.values.address}
						error={formik.errors?.address}
					/>
					<TitleLeft>
						Choose Token
					</TitleLeft>
					<TokenList>
						<Token active={formik.values.token === 'Biobit'} onClick={() => formik.setFieldValue('token', 'Biobit')}>
							<TokenIcon src={biobitIcon} />
							<TokenName>
								BBit
							</TokenName>
						</Token>
						<Token active={formik.values.token === 'Ethereum'} onClick={() => formik.setFieldValue('token', 'Ethereum')}>
							<TokenIcon src={etherIcon} />
							<TokenName>
								Ethereum
							</TokenName>
						</Token>
					</TokenList>
					<WalletInput
						label={'Amount'}
						placeholder={'Enter amount'}
						hint={getBalanceHint()} // will change based on token chosen
						actions={[
							{
								content: 'Max',
								onClick: async () => {
									const value = formik.values.token === 'Biobit' ? convertToBiobit(+appState.biobitBalance) : +appState.etherBalance;
									await formik.setFieldValue('amount', value);
								}
							}
						]}
						coloredAdornment
						onChange={(e) => formik.setFieldValue('amount', e.target.value)}
						name='amount'
						value={formik.values.amount}
						error={formik.errors?.amount}
						helperText="Transaction fee: 0 USTD"
					/>
					<WalletInput
						label={'You will get'}
						placeholder={'You will get'}
						adornment={'0 ETH.'} // #todo
						onChange={(e) => formik.setFieldValue('address', e.target.value)}
						name='address'
						value={formik.values.address}
						error={formik.errors?.address}
						helperText="= $ 0.0000056"
					/>
					<SendButton variant='primary' type='submit' disabled={!formik.isValid && !formik.isSubmitting && !formik.pristine}>
						Widthraw
					</SendButton>
				</Column>
			</Content>
		</Wrapper>
	);
};

export default WalletSendAssets;
