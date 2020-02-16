import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO } from "../common/config";

export default async (req: NowRequest, res: NowResponse) => {
  try {
    const files = await github.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path: "/"
    });
    return res.json({ files });
  } catch (error) {
    res.status(500);
    res.json({ error });
  }
};
