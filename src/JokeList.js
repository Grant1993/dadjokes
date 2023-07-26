import React, { useState, useEffect } from "react";
import Joke from "./Joke";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./JokeList.css";

const numJokesToGet = 10;

function JokeList() {
  const [jokes, setJokes] = useState(
    JSON.parse(window.localStorage.getItem("jokes") ?? "[]")
  );
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const seenJokes = new Set(jokes.map((j) => j.text));
      const fetchedJokes = [];
      setLoading(true);
      while (fetchedJokes.length < numJokesToGet) {
        const res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        let newJoke = res.data.joke;
        if (!seenJokes.has(newJoke)) {
          fetchedJokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
        }
      }
      setJokes((prev) => [...prev, ...fetchedJokes]);
      setLoading(false);
    } catch (e) {
      alert(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jokes.length === 0) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("jokes", JSON.stringify(jokes));
  }, [jokes]);

  function handleVote(id, delta) {
    setJokes((st) =>
      st.map((j) => (j.id === id ? { ...j, votes: j.votes + delta } : j))
    );
  }

  const handleClick = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className='JokeList-spinner'>
        <i className='far fa-8x fa-laugh fa-spin' />
        <h1 className='JokeList-title'>Loading...</h1>
      </div>
    );
  }

  return (
    <div className='JokeList'>
      <div className='JokeList-sidebar'>
        <h1 className='JokeList-title'>
          <span>Dad</span> Jokes
        </h1>
        <img
          src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'
          alt=''
        />
        <button className='JokeList-getmore' onClick={handleClick}>
          Fetch Jokes
        </button>
      </div>

      <div className='JokeList-jokes'>
        {jokes
          .sort((a, b) => b.votes - a.votes)
          .map((j) => (
            <Joke
              votes={j.votes}
              text={j.text}
              upvote={() => handleVote(j.id, 1)}
              downvote={() => handleVote(j.id, -1)}
            />
          ))}
      </div>
    </div>
  );
}

export default JokeList;
