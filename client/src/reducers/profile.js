import { 
	NEW_POST, 
	FETCH_POSTS, 
	FETCH_PROFILE, 
	RESTART_STATE,
	DELETE_POST
} from '../actions/profile'

const defaultState = {
	username: null,
	description: null,
	profilePic: null,	
	posts: {
		isThereMore: true,
		offset: 0,
		quantity: 5,		
		items: []
	}
}

export default (state = defaultState, action) => {
	switch(action.type) {
		case NEW_POST:			
			return {
				...state.posts,
				posts: [action.payload.newPost, ...state.posts.items]
			}
		case FETCH_POSTS:
			if(!!action.payload.posts.length)
				return {
					...state,
					posts: {
						...state.posts,
						quantity: state.posts.quantity,
						offset: state.posts.offset + state.posts.quantity,
						items: [...state.posts.items,...action.payload.posts]
					}
			}

			return {
				...state,
				posts: {
					...state.posts,
					isThereMore: false
				}
			}
		case FETCH_PROFILE:
			return { 
					...state,
					...action.payload.response 
			}
		case DELETE_POST:
			return {
				...state,
				posts: {
					...state.posts,
					items: state.posts.items.filter(post => post._id != action.payload._id)
				}
			}	
		case RESTART_STATE:
			return defaultState
		default:
			return state
	}
}