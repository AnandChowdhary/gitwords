import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO, UPDATE_MESSAGE } from "../common/config";
import { verifyToken } from "../common/secrets";

export default async (req: NowRequest, res: NowResponse) => {
  if (!(await verifyToken(req)))
    return res.status(401).json({ error: "invalid token" });
  const path = req.query.path;
  const content = Buffer.from(req.body.content).toString("base64");
  if (typeof path !== "string" || !path) throw new Error("path not provided");
  if (typeof content !== "string") throw new Error("content not provided");
  let sha: string | undefined = undefined;
  try {
    sha = ((await github.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path
    })) as any).data.sha;
  } catch (error) {}
  try {
    await github.repos.createOrUpdateFile({
      owner: OWNER,
      repo: REPO,
      message: UPDATE_MESSAGE,
      path,
      content,
      sha
    });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500);
    res.json({ error: "unable to update file" });
  }
};
