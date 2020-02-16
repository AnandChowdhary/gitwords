import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO } from "../common/config";

export default async (req: NowRequest, res: NowResponse) => {
  let path = req.query.path;
  if (typeof path !== "string" || !path) path = "/";
  try {
    const files = await github.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path
    });
    return res.json(files.data);
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to read contents" });
  }
};
