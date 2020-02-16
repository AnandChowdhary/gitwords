import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO, UPDATE_MESSAGE } from "../common/config";

export default async (req: NowRequest, res: NowResponse) => {
  const path = req.query.path;
  if (typeof path !== "string" || !path) throw new Error("path not provided");
  let sha: string | undefined = undefined;
  try {
    sha = ((await github.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path
    })) as any).sha;
  } catch (error) {}
  try {
    await github.repos.deleteFile({
      owner: OWNER,
      repo: REPO,
      message: UPDATE_MESSAGE,
      path,
      sha
    });
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to delete file" });
  }
};
