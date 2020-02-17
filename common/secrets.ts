import { github } from "./octokit";
import { OWNER, REPO, PASSWORD_PATH, SECRET_PATH } from "./config";
import { verify } from "jsonwebtoken";
import { NowRequest, NowResponse } from "@now/node";
import { Base64 } from "js-base64";

const contentToText = (content: string) => {
  return Base64.decode(content)
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

export const verifyToken = async (req: NowRequest) => {
  const token = req.headers.authorization;
  if (!token) return false;
  try {
    verify(token.replace("Bearer ", ""), await getSecret());
    return true;
  } catch (error) {}
  return false;
};
