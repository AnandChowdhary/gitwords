import { github } from "./octokit";
import { OWNER, REPO, PASSWORD_PATH, SECRET_PATH } from "./config";

const contentToText = (content: string) => {
  return Buffer.from(content, "base64")
    .toString("utf8")
    .replace(/\r?\n|\r/, "")
    .trim();
};

export const getPassword = async () => {
  return contentToText(
    ((
      await github.repos.getContents({
        owner: OWNER,
        repo: REPO,
        path: PASSWORD_PATH
      })
    ).data as any).content
  );
};

export const getSecret = async () => {
  return contentToText(
    ((
      await github.repos.getContents({
        owner: OWNER,
        repo: REPO,
        path: SECRET_PATH || PASSWORD_PATH
      })
    ).data as any).content
  );
};
