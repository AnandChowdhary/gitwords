import React, { useEffect, useState } from "react";
import { Redirect, useLocation, Link } from "react-router-dom";
import {
  useDispatch,
  useSelector as useReduxSelector,
  TypedUseSelectorHook
} from "react-redux";
import { RootState } from "../store";
const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

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
      if (path === "/" && files?.length) return;
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
  }, [pathname, token, dispatch]);
  return (
    <div>
      {!token ? <Redirect to="/" /> : ""}
      <button onClick={logout}>Logout</button>
      {loading && !files?.length ? (
        <div>Loading...</div>
      ) : (
        <div>
          <aside>
            <ul>
              {(files || []).map(file => (
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
