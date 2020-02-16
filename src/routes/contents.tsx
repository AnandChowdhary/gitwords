import React, { useEffect, useState } from "react";
import { Redirect, useLocation, Link } from "react-router-dom";
import ReactMde from "react-mde";
import Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

export default () => {
  let token: string | undefined = undefined;
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
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { pathname } = useLocation();
  const localToken = localStorage.getItem("token");
  if (localToken) token = JSON.parse(localToken);
  const getContents = async () => {
    setLoading(true);
    const path = pathname.replace("/contents", "") || "";
    try {
      const result = await (
        await fetch(`https://gitwords.now.sh/api/contents/?path=${path}`, {
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
      localStorage.removeItem("token");
      setError(true);
    }
  };
  useEffect(() => {
    getContents();
  }, [location]);
  const decode = (text?: string) => (text ? window.atob(text) : "");
  return (
    <div>
      {!token || error ? <Redirect to="/" /> : ""}
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
