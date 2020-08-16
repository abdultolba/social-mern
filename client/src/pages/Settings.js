import BottomScrollListener from 'react-bottom-scroll-listener'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Files from 'react-files'

import { changeImage } from '../actions/settings'
import { toggleNavbar } from '../actions/app'
import Loading from '../components/Loading'

import '../styles/pages/Profile.scss'

class Settings extends Component {
    constructor(props) {
        super(props)

        this.state = { tempPic: undefined }
        this.props.toggleNavbar(true)
        this.handleNewImage = this.handleNewImage.bind(this)
    }

    componentDidUpdate(prevProps) {
    }

    handleNewImage(File) {
        this.props.changeImage(File[0])
    }

    render() {
        return (
            <div className="container mt-5 pt-5">
                <label forhtml="profilepic">Profile Photo</label>
                <input type="file" id="profilepic" name="profilepic" onChange={this.handleNewImage} />

                <Files
                    className='files-dropzone'
                    onChange={this.handleNewImage}
                    accepts={['image/png', 'image/jpg', 'image/jpeg']}
                    maxFiles={5}
                    maxFileSize={10000000}
                    minFileSize={0}
                    clickable>
                    <button>Submit Image</button>
                </Files>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    user: state.profile
})
const mapDispatchToProps = dispatch => ({
    toggleNavbar: value => dispatch(toggleNavbar(value)),
    changeImage: binary => dispatch(changeImage(binary))
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)