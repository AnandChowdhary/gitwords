import React, { useState, FormEvent } from "react";
import { Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

export default () => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const token = useSelector(state => state);
  const login = async (event: FormEvent) => {
    event.preventDefault();
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
  };
  return (
    <div>
      {token ? <Redirect to="/contents" /> : ""}
      <h1>Login</h1>
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
