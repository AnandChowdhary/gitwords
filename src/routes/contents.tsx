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
const fileExtension = ".html";

const cleanFileName = (name: string) => {
  if (name.endsWith(fileExtension))
    name = name.substring(0, name.length - fileExtension.length);
  name = name.replace(/-/g, " ");
  return name.substring(20).trim();
};
const cleanDateTime = (name: string) => {
  return new Date(name.substring(0, 20)).toLocaleString();
};

const safeTwoDigitValue = (value: number) => {
  if (value > 9) value.toString();
  return `0${value}`;
};

const nowDateHelper = () => {
  const now = new Date();
  return `${now.getFullYear()}-${safeTwoDigitValue(
    now.getMonth() + 1
  )}-${safeTwoDigitValue(now.getDate())} ${safeTwoDigitValue(
    now.getHours()
  )}:${safeTwoDigitValue(now.getMinutes())}:${safeTwoDigitValue(
    now.getSeconds()
  )}`;
};

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const token = useSelector(state => state.token);
  const files = useSelector(state => state.files);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [renameFileName, setRenameFileName] = useState("");
  const [newFileLoading, setNewFileLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
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
    const filePath = `${nowDateHelper()} ${newFileName.replace(
      / /g,
      "-"
    )}${fileExtension}`;
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
    setNewFileLoading(false);
    setCreateNew(false);
  };

  const download = async () => {
    message.info("Creating an archive...");
    try {
      const result = await (
        await fetch(`/api/archive`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      ).blob();
      console.log("RESULT", result);
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `words-backup-${new Date().toLocaleDateString()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.parentNode?.removeChild(a);
      message.success("Downloading...");
    } catch (error) {
      setError("We weren't able to download the archive");
    }
  };
  const rename = async () => {
    setRenaming(true);
    const filePath = pathname.replace("/contents/", "");
    const newFilePath = `${nowDateHelper()} ${renameFileName.replace(
      / /g,
      "-"
    )}${fileExtension}`;
    try {
      const result = await (
        await fetch(`/api/rename/?path=${filePath}&newPath=${newFilePath}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      ).json();
      if (result) {
        history.push(`/contents/${newFilePath}`);
        message.success("Renamed");
        setRenameModal(false);
      }
    } catch (error) {
      setError("We weren't able to create a new file");
    }
    setRenaming(false);
  };
  const changePassword = async () => {
    setChangingPassword(true);
    try {
      const result = await (
        await fetch(`/api/password`, {
          method: "POST",
          body: JSON.stringify({
            currentPassword,
            newPassword
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      ).json();
      if (result && result.success) {
        message.success("Password changed");
        setChangePasswordModal(false);
      } else {
        throw new Error();
      }
    } catch (error) {
      setCurrentPassword("");
      setNewPassword("");
      message.error("Unable to change password");
    }
    setChangingPassword(false);
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
      <Modal
        title="Change Password"
        visible={changePasswordModal}
        onOk={changePassword}
        onCancel={() => setChangePasswordModal(false)}
        confirmLoading={changingPassword}
      >
        <Input
          prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
        />
        <Input
          prefix={<Icon type="key" style={{ color: "rgba(0,0,0,.25)" }} />}
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          style={{ marginTop: 20 }}
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
          <div style={{ textAlign: "center", margin: "20px 0" }}>
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
                  <Menu.Item
                    key="settings-password"
                    onClick={() => setChangePasswordModal(true)}
                  >
                    <Icon type="key" />
                    Change password
                  </Menu.Item>
                  <Menu.Item key="settings-backup" onClick={download}>
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
            ) : (pathname.replace("/contents", "") || "/") === "/" ? (
              <div>
                <p className="lead">
                  Words is a place to <em>just write</em>.
                </p>
                <p>
                  To get started, select a post from the sidebar on the left, or
                  click on the "New" button above to create a new post.
                </p>
                <p>
                  This app is{" "}
                  <a href="https://github.com/AnandChowdhary/gitwords">
                    open sourced on GitHub
                  </a>
                  , but uses your private repository to store your content.
                  Running on ZEIT. If you have any questions or need help,
                  please write to{" "}
                  <a href="mailto:words@mail.anandchowdhary.com">
                    words@mail.anandchowdhary.com
                  </a>
                  .
                </p>
                <ul>
                  <li>
                    <span role="img" aria-label="">
                      🔒
                    </span>{" "}
                    All your content, secured in a private repository
                  </li>
                  <li>
                    <span role="img" aria-label="">
                      ⛅
                    </span>{" "}
                    Git-based version control and ZIP backups
                  </li>
                  <li>
                    <span role="img" aria-label="">
                      🔑
                    </span>{" "}
                    Encrypted file storage (coming soon)
                  </li>
                  <li>
                    <span role="img" aria-label="">
                      📁
                    </span>{" "}
                    Local backup so you never lose your work (coming soon)
                  </li>
                  <li>
                    <span role="img" aria-label="">
                      💸
                    </span>{" "}
                    Free and open-source for the world
                  </li>
                </ul>
              </div>
            ) : (
              <div>
                <h1>{cleanFileName(pathname.replace("/contents/", ""))}</h1>
                <div>
                  <time>
                    {cleanDateTime(pathname.replace("/contents/", ""))}
                  </time>
                </div>
                <ContentEditable
                  className="editor"
                  innerRef={contentEditableRef}
                  html={value}
                  onChange={e => setValue(e.target.value)}
                />
              </div>
            )}
          </Content>
          <Footer>&copy; Sukriti Kapoor and Anand Chowdhary</Footer>
        </Layout>
      </Layout>
    </div>
  );
};
