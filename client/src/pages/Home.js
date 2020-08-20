import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import RegisterForm from '../components/RegisterForm'
import LoginForm from '../components/LoginForm'

import { toggleNavbar } from '../actions/app'
import Logo from '../assets/images/logo.png'

class Home extends Component {
	constructor(props){
		super(props)
		this.toggleSignMode = this.toggleSignMode.bind(this)
	}

	componentDidMount() {
		if(this.props.isLogged)
			this.props.history.push(`/u/${this.props.user}`)
	}

	componentDidUpdate() {
		if(this.props.isLogged)
			this.props.history.push(`/u/${this.props.user}`)
	}

	toggleSignMode() {
		this.setState(prevState => ({
			signMode: !prevState.signMode
		}))
	}

	render(){
		return (
			<div className="home">
				<div className="row h-100">
					<div className="col-8 d-none d-md-flex flex-column justify-content-end pl-5 home__left">
						<h1 className="display-5 text-light home__left__text">						
							Deflect your attention
							<br/>
							on the current moment.
						</h1>
						{/* TODO: Name this application, not sure I like friend.ly */}
						<p className="lead text-light home__left__text">friend.ly - reconnect with your friends.</p>
					</div>
					<div className="col-12 col-md-4 bg-white home__right d-flex flex-column justify-content-center">
						<div className="row justify-content-center">
							<div className="col-6">
								<img src={Logo} className="mx-auto d-block img-fluid" />
							</div>
						</div>
						<div className="row pr-md-3">
							<div className="col-12 px-4">
								<div className="card border-0 rounded-0">
									<div className="card-body">
									{this.state.signMode ?
											<>
												<RegisterForm />
												<a className="mx-auto d-block mt-3 text-center cursor-pointer"
												   onClick={this.toggleSignMode}
												   href="#" >
													I already have an account 😇
												</a>
											</> :
											<>
												<LoginForm />
												<a className="mx-auto d-block mt-3 text-center cursor-pointer"
												   onClick={this.toggleSignMode}
												   href="#">
													I don't have an account yet 🤗
												</a>
											</>
										}
										<Link to="/explore" className="mx-auto d-block mt-3 text-center cursor-pointer">I want to explore first 🧭</Link>
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

const mapStateToProps = state => ({
	isLogged: state.app.logged.isLogged,
	user: state.app.logged.username
})

const mapDispatchToProps = dispatch => ({
	toggleNavbar: value => dispatch(toggleNavbar(value))
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)