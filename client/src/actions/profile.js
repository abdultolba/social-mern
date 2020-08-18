import axios from 'axios'
import cogoToast from 'cogo-toast'

export const FETCH_PROFILE = 'FETCH_PROFILE',
	FETCH_POSTS = 'FETCH_POSTS',
	NEW_POST = 'NEW_POST',
	RESTART_STATE = 'RESTART_STATE'
	DELETE_POST = 'DELETE_POST',
	SET_LOADING_POSTS = 'SET_LOADING_POSTS',
	LIKE_POST = 'LIKE_POST',
	UNLIKE_POST = 'UNLIKE_POST'

export const fetchProfile = username => {
	return (dispatch, getState) => {
		const state = getState()
		const { offset, quantity, isThereMore } = state.profile.posts
		const { _id: id } = state.app.logged

		axios.get(`http://localhost:3000/user/${username}`)
			.then(res => {
				if (res.data.code == 200) {
					dispatch({
						type: FETCH_PROFILE,
						payload: {
							...res.data.response,
							ownProfile: state.app.logged.username == res.data.response.username
						}
					})
				}
			})
	}
}

export const fetchPosts = username => {
	return (dispatch, getState) => {
		const { offset, quantity, morePosts } = getState().profile.posts;

		if (morePosts) {
			dispatch(setLoadingPosts(true));
			axios.get(`http://localhost:3000/user/${username}/posts?offset=${offset}&quantity=${quantity}`)
				.then(res => {
					if (res.data.code == 200)
						dispatch({
							type: FETCH_POSTS,
							payload: {
								posts: res.data.response.map(post => ({
									...post,
									liked: post.likedBy.includes(id)
								}))
							}
						})
					dispatch(setLoadingPosts(false));
				})
				.catch(e => console.log(e));
		} else {
			cogoToast.info(`You've reached the bottom!`, { 
			    position: 'bottom-right'
			});
		}
	}
}

export const likePost = postId => {
	return (dispatch, getState) => {
		const state = getState()
		const { token } = state.app.logged

		axios.post(`http://localhost:3000/post/${postId}/like`, { token })
			.then(res => {
				if (res.data.code == 200)
					dispatch({
						type: LIKE_POST,
						payload: { likedPost: res.data.response }
					})
			})
			.catch(e => console.log(e))
	}
}

export const unlikePost = postId => {
	return (dispatch, getState) => {
		const state = getState()
		const { token } = state.app.logged

		axios.post(`http://localhost:3000/post/${postId}/unlike`, {token})
			.then(res => {				
				if(res.data.code == 200){
					cogoToast.success(`Post submitted`, { 
					    position: 'bottom-right'
					});
					dispatch({
						type: UNLIKE_POST,
						payload: {
							unlikedPost: res.data.response
						}
					})
				}
			})
			.catch(e => {
				cogoToast.error(`Something went wrong while submitting your post.`, { 
				    position: 'bottom-right'
				});
			})
	}
}

export const newPost = data => {
	return (dispatch, getState) => {
		const state = getState();
		const { username, message } = data;
		const { token } = state.app.logged;

		axios.post(`http://localhost:3000/user/${username}/new/post`, { message, token })
			.then(res => {
				if (res.data.code == 200)
					dispatch({
						type: NEW_POST,
						payload: { newPost: res.data.response }
					})
			})
			.catch(e => console.log(e));
	}
}

export const restartState = data => {
	return dispatch => dispatch({
		type: RESTART_STATE
	})
}

export const deletePost = data => {
	return (dispatch, getState) => {
		const state = getState();
		const { username, postId } = data;
		const { token } = state.app.logged;

		axios.post(`http://localhost:3000/user/${username}/delete/post`, { postId, token })
			.then(res => {
				cogoToast.success(`Your post has been deleted.`, { 
				    position: 'bottom-right'
				});
				dispatch({
					type: DELETE_POST,
					payload: { ...res.data.response }
				})
			})
			.catch(e => console.log(e));
	}
}

export const setLoadingPosts = loading => {
	return dispatch => dispatch({
		type: SET_LOADING_POSTS,
		payload: {
			loading
		}
	})
}