import React, { useState, FormEvent } from "react";
import { Redirect } from "react-router-dom";
import {
  useDispatch,
  useSelector as useReduxSelector,
  TypedUseSelectorHook
} from "react-redux";
import { RootState } from "../store";
import { Card, Form, Icon, Input, Button, Alert } from "antd";

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default () => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const token = useSelector(state => state.token);
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
      if (result && result.token)
        dispatch({
          type: "SET",
          token: result.token
        });
    } catch (error) {
      setError(true);
    }
    if (!token) setError(true);
    setPassword("");
    setLoading(false);
  };
  return (
    <div>
      {token ? <Redirect to="/contents" /> : ""}
      <div
        style={{ background: "#ECECEC", padding: "25vh 0", minHeight: "100vh" }}
      >
        <div style={{ width: 300, margin: "auto" }}>
          {error ? (
            <Alert
              message="Invalid password"
              description="We weren't able to log you into Words, please double check your password."
              type="error"
              closable
              onClose={() => setError(false)}
              style={{ marginBottom: 20 }}
            />
          ) : (
            ""
          )}
          <Card title="Log into Words" bordered={false}>
            <Form onSubmit={login} className="login-form">
              <Input
                prefix={
                  <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="login-form-button"
                style={{ marginTop: 20 }}
                block
              >
                Login
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};
