import React, { useEffect, useState } from "react";
import { Redirect, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

export default () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state);
  const [files, setFiles] = useState<
    {
      name: string;
      path: string;
    }[]
  >([]);
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
      const path = pathname.replace("/contents", "") || "";
      const result = await (
        await fetch(`/api/contents/?path=${path}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      ).json();
      if (Array.isArray(result)) {
        setFiles(result);
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
  }, [pathname]);
  return (
    <div>
      {!token ? <Redirect to="/" /> : ""}
      <button onClick={logout}>Logout</button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <aside>
            <ul>
              {files.map(file => (
                <li key={file.path}>
                  <Link to={`/contents/${file.path}`}>{file.name}</Link>
                </li>
              ))}
            </ul>
          </aside>
          <main>{value}</main>
        </div>
      )}
    </div>
  );
};
