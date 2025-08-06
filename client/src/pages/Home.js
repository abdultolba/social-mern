import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import AuthForm from "../components/AuthForm";
import { toggleNavbar, signIn, signUp } from "../actions/app";

const phrases = [
  {
    extra: "Marcus Aurelius - Meditations",
    quote:
      "Waste no more time arguing\nabout what a good man should be.\nBe one.",
  },
  {
    extra: "William Shakespeare - All's Well That Ends Well",
    quote: "What is a friend?\nA single soul dwelling in two bodies.",
  },
  {
    extra: "Marcus Aurelius - Meditations",
    quote:
      "You have power over your mind - \nnot outside events. Realize this, \nand you will find strength.",
  },
  {
    extra: "Aristotle",
    quote: "Love all, trust a few, do wrong to none.",
  },
  {
    extra: "Marcus Aurelius - Meditations",
    quote: "The best revenge is to be\nunlike him who performed the injury",
  },
];

const Home = () => {
  const [signMode, setSignMode] = useState("menu");
  const [selectedPhrase, setSelectedPhrase] = useState({});
  const isLogged = useSelector((state) => state.app.logged.isLogged);
  const user = useSelector((state) => state.app.logged.username);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLogged) {
      navigate(`/u/${user}`);
    }

    const randomNumber = Math.floor(Math.random() * phrases.length);
    setSelectedPhrase(phrases[randomNumber]);

    dispatch(toggleNavbar(false));

    return () => {
      dispatch(toggleNavbar(true));
    };
  }, [isLogged, user, navigate, dispatch]);

  const getAuthComponent = () => {
    switch (signMode) {
      case "signup":
        return (
          <AuthForm
            type="signup"
            backMethod={() => setSignMode("menu")}
            onSuccess={(data) => dispatch(signUp(data))}
          />
        );
      case "login":
        return (
          <AuthForm
            type="login"
            backMethod={() => setSignMode("menu")}
            onSuccess={(data) => dispatch(signIn(data))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="home">
      <div className="row h-100">
        <div className="col-8 d-none d-md-flex flex-column justify-content-end pl-5 home__left">
          <h1 className="display-7 text-light home__left__text">
            {selectedPhrase.quote}
          </h1>
          {!!selectedPhrase.extra && (
            <p className="text-light lead home__left__tex">
              {selectedPhrase.extra}
            </p>
          )}
        </div>
        <div className="col-12 col-md-4 bg-white home__right d-flex flex-column justify-content-center">
          <div className="row justify-content-center">
            <div className="col-6">{/* TODO: Add logo */}</div>
          </div>
          <div className="row pr-md-3">
            <div className="col-12 px-4">
              <div className="card border-0 rounded-0">
                <div className="card-body">
                  {signMode === "menu" && (
                    <div>
                      <button
                        className="btn btn-outline-brand btn-block rounded-pill"
                        onClick={() => setSignMode("signup")}
                      >
                        Sign Up
                      </button>
                      <button
                        className="btn btn-brand btn-block text-light rounded-pill"
                        onClick={() => setSignMode("login")}
                      >
                        Log In
                      </button>
                      <hr />
                      <Link
                        to="/explore"
                        className="btn btn-brand-secondary btn-block text-white rounded-pill"
                      >
                        Let me explore first 💡
                      </Link>
                    </div>
                  )}
                  {signMode !== "menu" && <>{getAuthComponent()}</>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
