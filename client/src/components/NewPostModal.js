import React, { Component } from 'react'
import { connect } from 'react-redux'
import Rodal from 'rodal'

import NewPostForm from './NewPostForm'
import { togglePostModal } from '../actions/app'

import 'rodal/lib/rodal.css'

class NewPostModal extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Rodal
                visible={this.props.isVisible}
                onClose={this.props.togglePostModal}
                animation={'slideUp'}
                width={600}
                height={160}>
                <NewPostForm profileId={this.props.profileId} onSuccess={this.props.togglePostModal} />
            </Rodal>
        )
    }
}

const mapStateToProps = state => ({
    profileId: state.app.logged.username,
    isVisible: state.app.postModal.isVisible
})

const mapDispatchToProps = dispatch => ({
    togglePostModal: () => dispatch(togglePostModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(NewPostModal)