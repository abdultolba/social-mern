import React, { Component, lazy } from 'react'
import { connect } from 'react-redux'
import BottomScrollListener from 'react-bottom-scroll-listener'
import cogoToast from 'cogo-toast'

import { fetchUserPosts, newPost, restartState as restartStatePosts } from '../actions/posts'
import { fetchProfile, restartState, toggleSidenav, toggleEditingDescription } from '../actions/profile'
import { toggleNavbar, toggleProfilePictureModal } from '../actions/app';
import { changeDescription } from '../actions/settings';
import { logout } from '../actions/app'

const ProfilePictureModal = lazy(() => import('../components/ProfilePictureModal'))
const NewPostForm = lazy(() => import('../components/NewPostForm'))
const Loading = lazy(() => import('../components/Loading'))
const Post = lazy(() => import('../components/Post'))
const Auth = lazy(() => import('../components/Auth'))

class Profile extends Component {
	constructor(props) {
		super(props)

		this.openProfilePictureModal = this.openProfilePictureModal.bind(this)
		this.updateDescription = this.updateDescription.bind(this)
	}

	componentDidMount() {
		this.initializeProfile()
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (this.props.location !== prevProps.location) {
			this.props.restartState()
			this.props.restartStatePosts()
			this.initializeProfile()
		}
	}

	componentWillUnmount() {
		this.props.restartState()
		this.props.restartStatePosts()
	}

	fetchUserPosts() {
		const profileId = this.props.match.params.id

		this.props.fetchUserPosts(profileId)
	}

	initializeProfile() {
		this.props.fetchProfile(this.props.match.params.id)
		this.fetchUserPosts()
	}

	openProfilePictureModal() {
		if (this.props.ownsProfile)
			this.props.toggleProfilePictureModal()
	}

	updateDescription(e) {
		e.preventDefault()
		const description = e.target.description.value

		if (this.props.profile.description == description) {
			cogoToast.warn(<p>Wait! <strong>The descriptions look the same... 🙊</strong></p>, {
				position: 'bottom-right'
			})
		} else if (description.length > 150) {
			cogoToast.warn("Descriptions may not be longer than 150 characters", {
				position: 'bottom-right'
			})
		} else {
			Promise.resolve(this.props.changeDescription(description))
				.then(() => this.props.toggleEditingDescription())
		}

	}

	render() {
		return (
			<div className="d-flex flex-column flex-md-row profile w-100">
				{(this.props.profilePicModal && this.props.ownsProfile) && <ProfilePictureModal />}
				<div className={"d-none d-md-flex sidenav flex-column " + (!this.props.profile.visibleSidenav ? 'sidenav--inactive' : '')}>
					<div className="sidenav__description">
						<div
							onClick={this.openProfilePictureModal}
							className={"sidenav__avatar mx-auto d-block mt-5 mb-2" + (this.props.ownsProfile && ' sidenav__avatar--owner cursor-pointer')}>
							<img src={this.props.profile.profilePic}
								className={'sidenav__avatar__image img-fluid rounded-circle mx-auto d-block w-100 h-100'} />
							<span className='sidenav__avatar--owner__camera'><i className="fas fa-camera"></i></span>
						</div>
						<p className="text-center text-dark title mt-3">{this.props.profile.username}</p>
						{this.props.profile.editingDescription
							?
							<div className="px-5 mb-3">
								<form onSubmit={this.updateDescription}>
									<div className="form-group">
										<textarea
											className="form-control"
											id="description"
											defaultValue={this.props.profile.description}
											maxLength={150}>
										</textarea>
									</div>
									<div className="form-group d-flex justify-content-end">
										<button
											className="btn btn-brand-secondary text-white mr-2 rounded-pill"
											type="button"
											onClick={this.props.toggleEditingDescription}>
											Cancel
											</button>
										<button className="btn btn-brand text-white rounded-pill">Update</button>
									</div>
								</form>
							</div>
							:
							<p className="text-left text-dark text-wrap description px-5 mb-0">
								{this.props.profile.description || "This user hasn't yet provided a description 🥴"}
							</p>
						}
						{(this.props.ownsProfile && !this.props.profile.editingDescription) &&
							<a className="text-left btn-link text-black-50 btn px-5"
								onClick={this.props.toggleEditingDescription}>
								Edit Description <i className="fas fa-pencil-alt"></i>
							</a>
						}
						<div className="d-flex flex-column justify-content-between h-100">
							<div className="d-flex justify-content-between px-5">
								<div>
									<p className="text-white mb-0">{this.props.profile.posts} Posts</p>
								</div>
								<div>
									<p className="text-white mb-0">{this.props.profile.likes} Likes</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<BottomScrollListener onBottom={() => { this.setState(() => ({ ...this.state })); this.fetchUserPosts() }}>
					{scrollRef => (
						<div className="d-flex position-relative profile__body justify-content-center flex-wrap" ref={scrollRef}>
							<Auth>
								{(this.props.profile.openProfile || this.props.ownsProfile)
									?
									<div className="profile__body__textarea w-100 mt-5">
										<div className="card border-0">
											<div className="card-body">
												<NewPostForm profileId={this.props.match.params.id} />
											</div>
										</div>
									</div>
									:
									<p className="mt-5">
										<i className="fas fa-lock"></i> This user hasn't authorized other users to post on their profile.
										</p>
								}
							</Auth>
							<div className="profile__body__posts w-100">
								<div className="d-flex flex-column">
									{this.props.posts.map((post, i) => <Post {...post} key={post.message + '_' + i} />)}
									{this.props.postsLoading && <div className="d-flex justify-content-center"><Loading classes="my-5" /></div>}
								</div>
							</div>
						</div>
					)}
				</BottomScrollListener>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	logged: state.app.logged,
	ownsProfile: state.profile.ownProfile,
	profilePicModal: state.app.profilePicModal.isVisible,
	profile: state.profile,
	posts: state.posts.items,
	postsLoading: state.posts.loading
})

const mapDispatchToProps = dispatch => ({
	changeDescription: description => dispatch(changeDescription(description)),
	toggleNavbar: value => dispatch(toggleNavbar(value)),
	toggleProfilePictureModal: () => dispatch(toggleProfilePictureModal()),
	toggleSidenav: () => dispatch(toggleSidenav()),
	fetchProfile: value => dispatch(fetchProfile(value)),
	newPost: value => dispatch(newPost(value)),
	fetchUserPosts: value => dispatch(fetchUserPosts(value)),
	toggleEditingDescription: () => dispatch(toggleEditingDescription()),
	restartState: () => dispatch(restartState()),
	restartStatePosts: () => dispatch(restartStatePosts()),
	logout: () => dispatch(logout())
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)