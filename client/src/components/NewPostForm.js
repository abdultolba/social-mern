import React, { Component } from 'react'
import { connect } from 'react-redux'

import { newPost } from '../actions/posts'

class NewPostForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            youtubeInput: false,
            randomPhrasesTextarea: [
                "What's on your mind?",
                "What are you up to today?",
                "Tell us a story..."
            ],
            selectedPlaceholderPhrase: null
        }

        this.handleNewPost = this.handleNewPost.bind(this)
        this.getRandomQuote = this.getRandomQuote.bind(this)
        this.toggleYoutubeInput = this.toggleYoutubeInput.bind(this)
    }

    componentWillUnmount() { }

    componentDidMount() {
        this.getRandomQuote()
    }

    toggleYoutubeInput() {
        this.setState(prevState => ({
            youtubeInput: !prevState.youtubeInput
        }))
    }

    getRandomQuote() {
        const rand = Math.floor(Math.random() * this.state.randomPhrasesTextarea.length)
        this.setState(({
            selectedPlaceholderPhrase: this.state.randomPhrasesTextarea[rand]
        }))
    }

    handleNewPost(e) {
        e.preventDefault()

        this.props.newPost({
            username: this.props.profileId,
            message: e.target.message.value,
            extra: {
                value: e.target.extra.value,
                extraType: 'youtube'
            }
        })

        e.target.message.value = ''
        e.target.extra.value = ''
    }

    render() {
        return (
            <div className="d-flex">
                <div className="mr-4 d-none d-md-block">
                    <img src={this.props.logged.profilePic} className="d-block mx-auto rounded-circle border" style={{ width: '75px' }} />
                </div>
                <div className="mt-2 w-100">
                    <form onSubmit={this.handleNewPost}>
                        <div className="form-group">
                            <textarea
                                id="message"
                                name="message"
                                className="form-control border-top-0 border-left-0 border-right-0 border-brand rounded-0 profile__body__textarea__input"
                                required
                                placeholder={this.state.selectedPlaceholderPhrase}>
                            </textarea>
                        </div>
                        <div className="form-group">
                            <input name="extra" id="extra" className={"form-control mt-2 " + (this.state.youtubeInput ? 'd-flex' : 'd-none')} placeholder="https://www.youtube.com/watch?v=jTOyQJuZuy4" />
                        </div>
                        <div className="form-group">
                            <button type="submit" className="btn btn-brand rounded-pill float-right text-white">
                                <i className="fas fa-paper-plane"></i> Submit
                            </button>
                            <button type="button" onClick={this.toggleYoutubeInput} className="btn btn-brand-secondary text-white rounded-pill float-right px-3 mx-2">
                                <i className="fab fa-youtube"></i> Youtube
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}
const mapStateToProps = state => ({
    logged: state.app.logged,
    profile: state.profile
})

const mapDispatchToProps = dispatch => ({
    newPost: value => dispatch(newPost(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewPostForm)