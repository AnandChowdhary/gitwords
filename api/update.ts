import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO, UPDATE_MESSAGE } from "../common/config";

export default async (req: NowRequest, res: NowResponse) => {
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
    })) as any).sha;
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
  } catch (error) {
    console.error(error);
    res.status(500);
    res.json({ error: "unable to update file" });
  }
};
