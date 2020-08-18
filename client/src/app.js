import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import Store from './store'
import { reconnect } from './actions/app'
import AppRouter from './routes/AppRouter'
import './styles/Main.scss'

const store = Store()
const last_session = localStorage.getItem('last_session')

if(last_session)
	store.dispatch(reconnect(JSON.parse(last_session)))

ReactDOM.render(
	<Provider store={store}>
		<AppRouter />
	</Provider>,
	document.getElementById('root')
)