import React from 'react';
import AppRouter from './components/Router';
import { theme } from './theme';
import { ThemeProvider } from 'styled-components';
import { Web3Provider } from './web3Provider';
import { GlobalStyle } from './globalStyle';

function App() {
	return (
		<div className="App">
			<Web3Provider>
				<ThemeProvider theme={theme}>
					<AppRouter />
					<GlobalStyle />
				</ThemeProvider>
			</Web3Provider>
		</div>
	);
}

export default App;
