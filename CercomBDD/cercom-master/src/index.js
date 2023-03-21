import React from 'react' ;
import ReactDOM from 'react-dom' ;
import './index.css' ;
import App from './App' ;
import reportWebVitals from './reportWebVitals' ;

import { createTheme, ThemeProvider } from '@mui/material/styles' ;

import './index.css' ;
import './assets/fonts/Enso-regular.ttf' ;
import './assets/fonts/Swanse-regular.ttf' ;
import './assets/fonts/Swanse-bold.ttf' ;
import './assets/fonts/Swanse-alternate.ttf' ;
import './assets/fonts/Swanse-alternatebold.ttf' ;

const theme = createTheme({
	palette : {
	  	primary : {
			main : '#ff0a85',
	  	},
		secondary : {
			main : '#3b3b3b',
	  	},
	  	white : {
			main : '#ffffff',
	  	},
		red : {
			main : '#ff0000',
	  	},  
	  	disconnectedleft : {
			main : '#17397899',
		},
		disconnectedright : {
			main : '#ff0a8599',
		},
		connectedleft : {
			main : '#173978',
		},
		connectedright : {
			main : '#ff0a85',
		},
		background : {
			primary : '#fff4e6',
			secondary : '#9adcff',
			gradient : 'linear-gradient(to bottom, #fff4e6, #fff4e6)',
		},
		menu : {
			gradient : 'linear-gradient(to bottom, #fff4e6, #f5dadf)',
			iconcolor : '#ffffff',
			transparent : '#ffffff00',
		},
		text : {
			primary : '#ff8aae',
			secondary : '#9adcff6',
			white : '#ffffff'
		},
		typography: {
			subtitle1: {
			},
			h1: {
			},
			body1: {
				color : '#ff8aae',
			},
			button: {
				color : '#ffffff',
				fontSize: 64,
			},
		},
		button : {
			background : '#ffffff',
			first : 'linear-gradient(to right, #fbf46d33 0%, #fbf46dff 51%, #fbf46d33 100%)',
			second : 'linear-gradient(to right, #1a2980 0%, #26d0ce 51%, #1a2980 100%)',
			third : 'linear-gradient(to right, #ac2f26 0%, #f3a183 51%, #ac2f26 100%)',
			fourth : 'linear-gradient(to right, #233329 0%, #63d471 51%, #233329 100%)',
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				contained: {
					color: 'white',
				},
			},
		},
	  }	
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme = {theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
