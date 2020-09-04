import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import appReducer from './reducers/app'
import profileReducer from './reducers/profile'
import postsReducer from './reducers/posts'
import usersReducer from './reducers/users'

const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const reducers = combineReducers({
	app: appReducer,
	profile: profileReducer,
	posts: postsReducer,
	users: usersReducer
})

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)))

export default store