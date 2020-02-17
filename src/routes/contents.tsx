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

const cleanFileName = (name: string) => {
  if (name.endsWith(".md")) name = name.substring(0, name.length - 3);
  name = name.replace(/-/g, " ");
  return name.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1)
  );
};

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
      let path = pathname.replace("/contents", "") || "/";
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
          files: result.filter(
            file => !["password.txt", "secret.txt"].includes(file.name)
          )
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
  const reloadFiles = () => {
    dispatch({
      type: "UNFILES"
    });
  };
  return (
    <div>
      {!token ? <Redirect to="/" /> : ""}
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={300}>
          <div className="logo">
            <Link to="/contents">Words</Link>
          </div>
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            {loading && !files?.length ? <Spin size="large" /> : ""}
          </div>
          <Menu theme="dark" mode="inline">
            {(files || []).map(file => (
              <Menu.Item key={file.path}>
                <Link to={`/contents/${file.path}`}>
                  {cleanFileName(file.name)}
                </Link>
              </Menu.Item>
            ))}
          </Menu>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              type="primary"
              shape="circle"
              icon="reload"
              onClick={reloadFiles}
            />
          </div>
        </Sider>
        <Layout>
          <Header style={{ background: "#fff" }}>
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
