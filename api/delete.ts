import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO, UPDATE_MESSAGE } from "../common/config";
import { verifyToken } from "../common/secrets";

export default async (req: NowRequest, res: NowResponse) => {
  if (!(await verifyToken(req)))
    return res.status(401).json({ error: "invalid token" });
  const path = req.query.path;
  if (typeof path !== "string" || !path) throw new Error("path not provided");
  try {
    const sha: string = ((await github.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path
    })) as any).sha;
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
    res.json({ error: "unable to delete file" });
  }
};
