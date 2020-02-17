import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO, UPDATE_MESSAGE } from "../common/config";
import { verifyToken } from "../common/secrets";

export default async (req: NowRequest, res: NowResponse) => {
  if (!(await verifyToken(req)))
    return res.status(401).json({ error: "invalid token" });
  const path = req.query.path;
  const newPath = req.query.newPath;
  if (
    typeof path !== "string" ||
    !path ||
    typeof newPath !== "string" ||
    !newPath
  )
    throw new Error("paths required");
  try {
    const files = await github.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path
    });
    const sha = (files.data as any).sha;
    const encodedData = (files.data as any).content;
    await github.repos.createOrUpdateFile({
      owner: OWNER,
      repo: REPO,
      message: UPDATE_MESSAGE,
      path: newPath,
      content: encodedData
    });
    await github.repos.deleteFile({
      owner: OWNER,
      repo: REPO,
      message: UPDATE_MESSAGE,
      path,
      sha
    });
    return res.json({ success: true });
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to read contents" });
  }
};
