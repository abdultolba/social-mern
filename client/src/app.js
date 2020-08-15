import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import createStore from './store'
import { reconnect } from './actions/app'
import AppRouter from './routes/AppRouter'
import './styles/Main.scss'

const store = configStore()

store.subscribe(() => {
	console.log(store.getState())
})

const last_session = localStorage.getItem('last_session')

if(last_session){
	store.dispatch(reconnect(JSON.parse(last_session)))
}

ReactDOM.render(
	<Provider store={store}>
		<AppRouter />
	</Provider>,
	document.getElementById('root')
)