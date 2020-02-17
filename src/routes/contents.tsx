import React, { useEffect, useState } from "react";
import { Redirect, useLocation, Link } from "react-router-dom";
import ReactMde from "react-mde";
import Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { useSelector, useDispatch } from "react-redux";

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

export default () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state);
  const [files, setFiles] = useState<
    {
      name: string;
      path: string;
    }[]
  >([]);
  const [value, setValue] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">(
    "write"
  );
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { pathname } = useLocation();
  const getContents = async () => {
    setLoading(true);
    const path = pathname.replace("/contents", "") || "";
    try {
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
    } catch (error) {
      dispatch({
        type: "UNSET"
      });
      console.log("Error, logging you out");
    }
  };
  useEffect(() => {
    getContents();
  }, [location]);
  const decode = (text?: string) => (text ? window.atob(text) : "");
  return (
    <div>
      {!token ? <Redirect to="/" /> : ""}
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
          <ReactMde
            value={value}
            onChange={setValue}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            generateMarkdownPreview={markdown =>
              Promise.resolve(converter.makeHtml(markdown))
            }
          />
        </div>
      )}
    </div>
  );
};
