import React, { useEffect, useState } from "react";
import { Redirect, useLocation, Link } from "react-router-dom";
import {
  useDispatch,
  useSelector as useReduxSelector,
  TypedUseSelectorHook
} from "react-redux";
import { RootState } from "../store";
import { Button, Layout, Spin, Menu } from "antd";
const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
const { Header, Footer, Sider, Content } = Layout;

export default () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.token);
  const files = useSelector(state => state.files);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { pathname } = useLocation();
  const logout = () => {
    dispatch({
      type: "UNSET"
    });
  };
  useEffect(() => {
    const getContents = async () => {
      setLoading(true);
      const path = pathname.replace("/contents", "") || "/";
      if (path === "/" && files?.length) return setLoading(false);
      const result = await (
        await fetch(`/api/contents/?path=${path}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      ).json();
      if (Array.isArray(result)) {
        dispatch({
          type: "FILES",
          files: result
        });
      } else {
        setValue(window.atob(result.content));
      }
      setLoading(false);
    };
    getContents()
      .then(() => {})
      .catch(() =>
        dispatch({
          type: "UNSET"
        })
      );
  }, [pathname, files, token, dispatch]);
  return (
    <div>
      {!token ? <Redirect to="/" /> : ""}
      <Layout>
        <Sider width={300}>
          <Menu theme="dark" mode="inline">
            {loading && !files?.length ? <Spin /> : ""}
            {(files || []).map(file => (
              <Menu.Item key={file.path}>
                <Link to={`/contents/${file.path}`}>{file.name}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout>
          <Header>
            <Button type="primary">New</Button>
            <Button type="default" onClick={logout}>
              Logout
            </Button>
          </Header>
          <Content>{loading ? <Spin /> : value}</Content>
          <Footer>Footer</Footer>
        </Layout>
      </Layout>
    </div>
  );
};
