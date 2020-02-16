import React, { useState, FormEvent } from "react";
import { useLocalStorage } from "../hooks/storage";
import { Redirect } from "react-router-dom";

export default () => {
  const [password, setPassword] = useState("");
  const [token, setToken] = useLocalStorage("token", null);
  const login = async (event: FormEvent) => {
    event.preventDefault();
    const result: { token: string } = await (
      await fetch(
        "https://cors-anywhere.herokuapp.com/https://gitwords.now.sh/api/login",
        {
          method: "POST",
          body: JSON.stringify({
            password
          }),
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    ).json();
    setToken(result.token);
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
