import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router';
import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';
import { mainContext } from '../../state';
import { convertToBiobit } from '../../utils';
import * as ethUtil from 'ethereumjs-util';
import { encrypt } from 'eth-sig-util';
import { toast, ZRNG, getFileNameWithExt } from '../../utils';
import { useWeb3React } from '@web3-react/core';
import Mobile from './Mobile';
import Desktop from './Desktop';
import { twofish } from 'twofish';

const RequestDetailsPage = () => {
	const { id } = useParams();
	const [request, setRequest] = useState({});
	const { appState } = useContext(mainContext);
	const sendSignalRef = useRef(null);
	const [showDialog, setDialog] = useState(false);
	const [isSubmitting, setSubmitting] = useState(false);
	const [dialogMessage, setDialogMessage] = useState('');
	const [error, setError] = useState(false);
	const { account } = useWeb3React();

	const clearSubmitDialog = () => {
		setSubmitting(false);
		setDialogMessage('');
		if (sendSignalRef.current !== null) sendSignalRef.current.value = null;
	};

	const submitSignal = (e) => {
		if (Object.keys(request).length !== 0)
			if (sendSignalRef !== null) {
				setDialog(true);
				if (account) {
					if (sendSignalRef.current.value !== null && sendSignalRef.current.value !== '') {
						setDialog(false);
						setSubmitting(true);
						setDialogMessage('encrypting file');

						const reader = new FileReader();

						reader.readAsArrayBuffer(sendSignalRef.current.files[0]); // Read Provided File

						reader.onloadend = async () => {
							const ipfs = create(process.env.REACT_APP_IPFS); // Connect to IPFS
							const buff = Buffer(reader.result); // Convert data into buffer
							// generate AES related keys
							const AES_IV = ZRNG();
							const AES_KEY = ZRNG();

							// file encryption
							var twF = twofish(AES_IV),
								encryptedFile = twF.encryptCBC(AES_KEY, buff); /* twF.encryptCBC expects an array */

							try {
								// AES key encryption using Metamask
								const encryptedAesKey = ethUtil.bufferToHex(
									Buffer.from(
										JSON.stringify(
											encrypt(
												request.encryptionPublicKey,
												{ data: AES_KEY.toString() },
												'x25519-xsalsa20-poly1305'
											)
										),
										'utf8'
									)
								);

								/* 
									to download file later (in the inbox page) with proper name and extension,
									here we store these meta information in an object on IPFS then we store this IPFS
									hash on the blockchain using our SC contribute method.
								*/
								const fileStuff = {
									AES_KEY: encryptedAesKey,
									AES_IV,
									FILE_EXT: getFileNameWithExt(sendSignalRef)[1],
									FILE_NAME: getFileNameWithExt(sendSignalRef)[0],
									FILE_MIMETYPE: getFileNameWithExt(sendSignalRef)[2],
								};

								setDialogMessage('uploading to ipfs');
								/* encrypted is an array */
								const fileResponse = await ipfs.add(encryptedFile);
								const fileStuffResponse = await ipfs.add(JSON.stringify(fileStuff));

								let url = `${process.env.REACT_APP_IPFS_LINK + fileResponse.path}`;
								console.log(`uploaded document --> ${url}`);

								setDialogMessage('awaiting confirmation');
								appState.contract.methods
									.contribute(
										request.requestID,
										request.requesterAddress,
										fileResponse.path,
										fileStuffResponse.path
									)
									.send(
										{
											from: account,
										},
										(error, result) => {
											if (!error) {
												clearSubmitDialog();
												toast(result, 'success', true, result);

												if (sendSignalRef.current !== null) sendSignalRef.current.value = null;
											} else {
												clearSubmitDialog();
												toast(error.message, 'error');
											}
										}
									);

								appState.contract.events
									.Contributed({})
									.on('data', (event) => {
										clearSubmitDialog();
										toast(
											`signal submitted on request #${event.returnValues[1]} for address: ${event.returnValues[2]}`,
											'success',
											false,
											null,
											{
												toastId: event.id,
											}
										);
									})
									.on('error', (error, receipt) => {
										clearSubmitDialog();
										toast(error.message, 'error');
										console.error(error, receipt);
									});
							} catch (error) {
								clearSubmitDialog();
								console.error(error);
							}
						};
					} else {
						setError('please select files to upload');
					}
				}
			}
	};

	useEffect(() => {
		if (appState.contract !== null) {
			appState.contract.methods.Categories(id).call((error, result) => {
				if (!error) {
					let categories = result[0];
					let businessCategory = result[1];

					if (+businessCategory === +process.env.REACT_APP_ZARELA_BUSINESS_CATEGORY)
						// only show zarela requests
						appState.contract.methods.orders(id).call((error, result) => {
							if (!error) {
								const requestTemplate = {
									requestID: result[0],
									title: result[1],
									description: result[6],
									requesterAddress: result[2],
									tokenPay: convertToBiobit(result[3]),
									totalContributors: result[4], // total contributors required
									totalContributed: +result[4] - +result[7],
									whitePaper: result[5],
									timestamp: result[9],
									encryptionPublicKey: result[10],
									categories,
									totalContributedCount: result[8],
								};
								setRequest(requestTemplate);
							} else {
								console.error(error.message);
							}
						});
				} else {
					console.error(error.message);
				}
			});
		}
	}, [id, appState.contract]);

	if (appState.isMobile) {
		return (
			<Mobile
				{...{
					account,
					showDialog,
					isSubmitting,
					setSubmitting,
					dialogMessage,
					request,
					sendSignalRef,
					submitSignal,
					error,
					setError,
				}}
			/>
		);
	} else {
		return (
			<Desktop
				{...{
					account,
					showDialog,
					isSubmitting,
					setSubmitting,
					dialogMessage,
					request,
					sendSignalRef,
					submitSignal,
					error,
					setError,
				}}
			/>
		);
	}
};

export default RequestDetailsPage;
