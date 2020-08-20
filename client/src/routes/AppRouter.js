import React, { Component } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Home from '../pages/Home'
import Profile from '../pages/Profile'
import Error from '../pages/Error'
import Explore from '../pages/Explore';
import Navbar from '../components/Navbar'

class AppRouter extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<BrowserRouter>
				<Switch>
					<Route path="/" component={Home} exact />
					<Fragment>
						<div className="d-flex page">
							<Route path="/explore" component={Explore} />
							<Route path="/u/:id" component={Profile} />
							<Navbar />
						</div>
					</Fragment>
					<Route component={Error} />
				</Switch>
			</BrowserRouter>
		)
	}
}

export default AppRouter