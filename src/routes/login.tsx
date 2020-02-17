import React, { useState, FormEvent } from "react";
import { Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

export default () => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const token = useSelector(state => state);
  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result: { token: string } = await (
        await fetch("/api/login", {
          method: "POST",
          body: JSON.stringify({
            password
          }),
          headers: {
            "Content-Type": "application/json"
          }
        })
      ).json();
      dispatch({
        type: "SET",
        token: result.token
      });
    } catch (error) {
      setError(true);
    }
    if (!token) setError(true);
    setLoading(false);
  };
  return (
    <div>
      {token ? <Redirect to="/contents" /> : ""}
      <h1>Login</h1>
      {loading ? <p>Loading...</p> : ""}
      {error ? <p>We weren't able to log you in.</p> : ""}
      <form onSubmit={login}>
        <label>
          <span>Password</span>
          <input type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
