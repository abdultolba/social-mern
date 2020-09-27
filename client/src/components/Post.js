import React, { Component } from 'react'
import { connect } from 'react-redux'
import YouTube from 'react-youtube'
import Linkify from 'react-linkify'
import { Link, withRouter } from 'react-router-dom'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import cogoToast from "cogo-toast"

import { likePost, unlikePost, deletePost, editPost, toggleEditingPost } from '../actions/posts'

class Post extends Component {
	constructor(props) {
		super(props)

		this.deletePost = this.deletePost.bind(this)
		this.canEditOrDeletePost = this.canEditOrDeletePost.bind(this)
		this.handleLike = this.handleLike.bind(this)
		this.parseText = this.parseText.bind(this)

		dayjs.extend(relativeTime)
	}

	parseText() {
		const regex = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
		const textFractions = this.props.message.split
	}

	deletePost() {
		this.props.deletePost({ postId: this.props._id })
	}

	editPost = e => {
		e.preventDefault()
		const message = e.target.message.value

		if (this.props.message == message) {
			cogoToast.warn(<p>Wait! <strong>The post looks the same... 🙊</strong></p>, {
				position: 'bottom-right'
			})
		} else {
			Promise.resolve(this.props.editPost({ message, postId: this.props._id }))
				.then(() => this.props.toggleEditingPost(''))
		}
	}

	canEditOrDeletePost() {
		// If this is my post
		if (this.props.session._id && this.props.author._id)
			return this.props.session._id == this.props.author._id
		// If the post is visible on my profile, even if i'm not the author of it
		else if (this.props.session.username && this.props.match.params.id)
			return this.props.session.username == this.props.match.params.id;
	}

	handleLike() {
		if (!this.props.logged) {
			return cogoToast.warn(`Sorry, you need to be logged in to like this post 😔`, {
				position: 'bottom-right'
			})
		}

		if (this.props.liked) {
			this.props.unlikePost(this.props._id)
		} else {
			this.props.likePost(this.props._id)
		}
	}

	render() {
		return (
			<article className="card w-100 my-5 post">
				<div className="card-header bg-white pb-0 border-0 d-flex justify-content-between">
					<div>
						<small className="text-muted">{dayjs().from(dayjs(this.props.createdAt))} ago</small>
					</div>
					<div className="d-flex">
						<div>
							<Link to={'/u/' + this.props.author.username}>{this.props.author.username}</Link>
						</div>
						<div className="post__avatar ml-2">
							<Link to={'/u/' + this.props.author.username}>
								<img src={this.props.author.profilePic} alt={this.props.author.username} className="img-fluid cursor-pointer rounded-circle" />
							</Link>
						</div>
					</div>
				</div>
				<div className="card-body px-4 py-4">
					<Linkify properties={{ target: '_blank' }}>
						{this.props.editedPostId && (this.props._id == this.props.editedPostId)
						?
							<div className="px-5 mb-3">
								<form onSubmit={this.editPost}>
									<div className="form-group">
										<textarea 
											className="form-control border-top-0 border-left-0 border-right-0 border-brand rounded-0 profile__body__textarea__input" 
											id="message" 
											defaultValue={this.props.message}>
										</textarea>
									</div>
									<div className="form-group d-flex justify-content-end">
										<button
											className="btn btn-brand-secondary text-white mr-2 rounded-pill"
											type="button"
											onClick={() => this.props.toggleEditingPost('')}>
											Cancel
											</button>
										<button className="btn btn-brand text-white rounded-pill">Update</button>
									</div>
								</form>
							</div>
						:
							<p className="my-0 py-0 ws-pre-line">{this.props.message}</p>
						}
						
					</Linkify>
					{this.props.extra &&
						<div className="mt-3">
							<YouTube
								videoId={this.props.extra.value}
								opts={{
									width: '100%', 
									height: '400'
								}}/>
						</div>
					}
					<div onClick={this.handleLike} className="d-inline-flex px-3 py-1 text-brand-secondary rounded-pill post__likes cursor-pointer">
						<span>
							{this.props.likes} <i className={`mr-1 ${this.props.liked ? 'fas fa-heart' : 'far fa-heart'}`}></i>
						</span>
					</div>
					{this.canEditOrDeletePost() && !this.props.editedPostId &&
					<>
						<div onClick={() => this.props.toggleEditingPost(this.props._id)} className="d-inline-flex px-3 py-1 rounded-pill post__edit cursor-pointer">
							<span className="text-secondary">
								<i className="fas fa-pencil-alt"></i>
							</span>
						</div>
						<div onClick={this.deletePost} className="d-inline-flex px-3 py-1 rounded-pill post__delete cursor-pointer">
							<span className="text-secondary">
								<i className="fas fa-times"></i>
							</span>
						</div>
					</>
					}
				</div>
			</article>
		)
	}
}

const mapStateToProps = state => ({
	logged: state.app.logged.isLogged,
	session: state.app.logged,
	editedPostId: state.posts.editedPostId
})

const mapDispatchToProps = dispatch => ({
	editPost: data => dispatch(editPost(data)),
	deletePost: data => dispatch(deletePost(data)),
	likePost: postId => dispatch(likePost(postId)),
	unlikePost: postId => dispatch(unlikePost(postId)),
	toggleEditingPost: postId => dispatch(toggleEditingPost(postId))
})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Post))