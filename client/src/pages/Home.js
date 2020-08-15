import React, { Component } from 'react'
import RegisterForm from '../components/RegisterForm'
import LoginForm from '../components/LoginForm'
import { connect } from 'react-redux'

class Home extends Component {
	constructor(props){
		super(props)
	}

	componentDidMount() {
		if(this.props.isLogged)
			this.props.history.push(`/u/${this.props.user}`)
	}

	componentDidUpdate() {
		if(this.props.isLogged)
			this.props.history.push(`/u/${this.props.user}`)
	}

	render(){
		return (
			<div className="home">
				<div className="row h-100">
					<div className="col-6 d-none d-md-flex flex-column justify-content-end pl-5 home__left">
						<h1 className="display-4 text-light home__left__text">						
							Deflect your attention
							<br/>
							on the current moment.
						</h1>
						{/* TODO: Name this application, not sure I like friend.ly */}
						<p className="lead text-light home__left__text">friend.ly - reconnect with your friends.</p>
					</div>
					<div className="col-12 col-md-6 home__right d-flex flex-column justify-content-end">
						<div className="row flex-column align-content-end pr-md-5">
							<div className="col-md-8 col-12 px-4 py-4">
								<div className="card">
									<div className="card-body">
										<RegisterForm />
										<hr/>
										<LoginForm />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>				
			</div>
		)
	}
}

const stateToProps = state => ({
	isLogged: state.app.logged.isLogged,
	user: state.app.logged.username
})

export default connect(stateToProps)(Home)