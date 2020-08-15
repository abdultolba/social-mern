import { 
	NEW_POST, 
	FETCH_POSTS, 
	FETCH_PROFILE, 
} from '../actions/profile'

const defaultState = {
	username: null,
	description: null,
	profilePic: null,	
	posts: [1]	
}

export default (state = defaultState, action) => {
	switch(action.type) {
		case NEW_POST:			
			return {
				...state,
				posts: [action.payload.newPost, ...state.posts]
			}
		case FETCH_POSTS:
			return {
				...state,
				posts: action.payload.posts
			}
		case FETCH_PROFILE:
			return { ...action.payload.response }	
		default:
			return state
	}
}