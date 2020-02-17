import React, { useEffect, useState, createRef } from "react";
import { Redirect, useLocation, Link, useHistory } from "react-router-dom";
import {
  useDispatch,
  useSelector as useReduxSelector,
  TypedUseSelectorHook
} from "react-redux";
import { RootState } from "../store";
import {
  message,
  Button,
  Layout,
  Spin,
  Menu,
  Modal,
  Input,
  Icon,
  Alert,
  Dropdown
} from "antd";
import ContentEditable from "react-contenteditable";

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
const { Header, Footer, Sider, Content } = Layout;
const { confirm } = Modal;

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
  const history = useHistory();
  const token = useSelector(state => state.token);
  const files = useSelector(state => state.files);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [renameFileName, setRenameFileName] = useState("");
  const [newFileLoading, setNewFileLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [renameModal, setRenameModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { pathname } = useLocation();
  const contentEditableRef = createRef<HTMLElement>();
  const logout = () => {
    dispatch({
      type: "UNSET"
    });
  };
  useEffect(() => {
    const getContents = async (list = false) => {
      let path = list ? "/" : pathname.replace("/contents", "") || "/";
      if (path === "/") setValue("");
      setLoading(true);
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
    if (
      (!files || !files.length) &&
      (pathname.replace("/contents", "") || "/") !== "/"
    ) {
      getContents(true)
        .then(() => {})
        .catch(() => {});
    }
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
  const createFile = async () => {
    if (!newFileName.trim()) return;
    setNewFileLoading(true);
    const filePath = `${newFileName.replace(/ /g, "-")}.md`;
    try {
      await (
        await fetch(`/api/update/?path=${filePath}`, {
          method: "POST",
          body: JSON.stringify({
            content: "Write something here..."
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      ).json();
      history.push(`/contents/${filePath}`);
    } catch (error) {
      setError("We weren't able to create a new file");
    }
    setCreateNew(false);
  };
  const rename = async () => {
    setRenaming(true);
  };
  const deletePost = async () => {
    setDeleting(true);
    const filePath = pathname.replace("/contents/", "");
    try {
      const result = await (
        await fetch(`/api/delete/?path=${filePath}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      ).json();
      if (result) {
        history.push(`/contents`);
        message.success("Deleted");
      }
    } catch (error) {
      setError("We weren't able to create a new file");
    }
    setDeleting(false);
  };
  const save = async () => {
    setSaving(true);
    const filePath = pathname.replace("/contents/", "");
    try {
      const result = await (
        await fetch(`/api/update/?path=${filePath}`, {
          method: "POST",
          body: JSON.stringify({
            content: value
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      ).json();
      if (result) message.success("Saved");
    } catch (error) {
      setError("We weren't able to create a new file");
    }
    setSaving(false);
  };
  return (
    <div>
      {!token ? <Redirect to="/" /> : ""}
      <Modal
        title="Write Words"
        visible={createNew}
        onOk={createFile}
        onCancel={() => setCreateNew(false)}
        confirmLoading={newFileLoading}
      >
        <p>
          To create a new post, write a title below. Don't worry, you can always
          change it later.
        </p>
        <Input
          prefix={<Icon type="file-add" style={{ color: "rgba(0,0,0,.25)" }} />}
          type="text"
          placeholder="Title"
          value={newFileName}
          onChange={e => setNewFileName(e.target.value)}
        />
      </Modal>
      <Modal
        title="Rename"
        visible={renameModal}
        onOk={rename}
        onCancel={() => setRenameModal(false)}
        confirmLoading={renaming}
      >
        <Input
          prefix={<Icon type="file-add" style={{ color: "rgba(0,0,0,.25)" }} />}
          type="text"
          placeholder="New post title"
          value={renameFileName}
          onChange={e => setRenameFileName(e.target.value)}
        />
      </Modal>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={300}>
          <div className="logo">
            <Link to="/contents">Words</Link>
          </div>
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            {loading && !files?.length ? <Spin size="large" /> : ""}
          </div>
          <Menu
            selectedKeys={[pathname.replace("/contents/", "")]}
            theme="dark"
            mode="inline"
          >
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
          <Header
            style={{
              background: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Button type="primary" onClick={() => setCreateNew(true)}>
              New
            </Button>
            {(pathname.replace("/contents", "") || "/") !== "/" ? (
              <span>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="post-rename"
                        onClick={() => setRenameModal(true)}
                      >
                        <Icon type="edit" />
                        Rename
                      </Menu.Item>
                      <Menu.Item
                        key="post-delete"
                        onClick={() =>
                          confirm({
                            title: "Are you sure delete this post?",
                            content:
                              "Deleting a post is not reversible (you'll have to find it in the git history)",
                            okText: "Yes, delete it",
                            okType: "danger",
                            cancelText: "No, keep it",
                            onOk() {
                              deletePost();
                            },
                            onCancel() {}
                          })
                        }
                      >
                        <Icon type="delete" />
                        Delete
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button style={{ marginRight: 20 }}>
                    Edit post <Icon type="down" />
                  </Button>
                </Dropdown>
                <Button type="primary" loading={saving} onClick={save}>
                  <Icon type="save" />
                  Save post
                </Button>
              </span>
            ) : (
              ""
            )}
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="settings-password">
                    <Icon type="key" />
                    Change password
                  </Menu.Item>
                  <Menu.Item key="settings-backup">
                    <Icon type="download" />
                    Download backup
                  </Menu.Item>
                  <Menu.Item key="settings-logout" onClick={logout}>
                    <Icon type="user" />
                    Logout
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>
                Settings <Icon type="down" />
              </Button>
            </Dropdown>
          </Header>
          <Content style={{ width: "720px", margin: "40px auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", margin: "40px 0" }}>
                <Spin size="large" />
              </div>
            ) : error ? (
              <Alert
                message="Error"
                description={error}
                type="error"
                closable
                onClose={() => setError("")}
                style={{ marginBottom: 20 }}
              />
            ) : deleting ? (
              <Alert message="Deleting your post..." type="info" showIcon />
            ) : (
              <ContentEditable
                className="editor"
                innerRef={contentEditableRef}
                html={value}
                onChange={e => setValue(e.target.value)}
              />
            )}
          </Content>
          <Footer>&copy; Sukriti Kapoor and Anand Chowdhary</Footer>
        </Layout>
      </Layout>
    </div>
  );
};
