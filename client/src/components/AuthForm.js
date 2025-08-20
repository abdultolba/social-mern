import React, { Component } from "react";
import { connect } from "react-redux";

class AuthForm extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (this.props.type === "signup") {
      const password2 = e.target.password2.value;
      if (password !== password2) {
        this.setState({ error: "Passwords do not match" });
        return;
      }
    }

    this.setState({ error: null });
    this.props.onSuccess({ username, password });
  }

  render() {
    return (
      <>
        <form onSubmit={this.handleSubmit}>
          <fieldset disabled={this.props.isLoading}>
            <div className="form-group">
              <label htmlFor="username" className="mb-1 text-muted">
                <small>Username</small>
              </label>
              <input
                type="text"
                name="username"
                id="username"
                className="form-control rounded-0"
                required
                minLength="5"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="mb-1 text-muted">
                <small>Password</small>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-control rounded-0"
                required
                minLength="5"
              />
            </div>
            {this.props.type === "signup" && (
              <div className="form-group">
                <label htmlFor="password2" className="mb-1 text-muted">
                  <small>Confirm Password</small>
                </label>
                <input
                  type="password"
                  name="password2"
                  id="password2"
                  className="form-control rounded-0"
                  required
                  minLength="5"
                />
              </div>
            )}
            {this.state.error && (
              <p className="text-danger">
                <small>{this.state.error}</small>
              </p>
            )}
            <button className="btn btn-brand text-light float-right border-0 rounded-pill">
              {this.props.type == "signup" ? "Sign Up" : "Login"}
            </button>
            {this.props.backMethod && (
              <button
                onClick={this.props.backMethod}
                type="button"
                className="btn btn-brand-secondary text-white float-right border-0 rounded-pill mx-3"
              >
                Return
              </button>
            )}
          </fieldset>
        </form>
      </>
    );
  }
}

const stateToProps = (state) => ({
  isAuth: state.app.logged.isLogged,
  isLoading: state.app.logged.isLoading,
});

export default connect(stateToProps)(AuthForm);
