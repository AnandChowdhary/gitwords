import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO } from "../common/config";
import { verifyToken } from "../common/secrets";

export default async (req: NowRequest, res: NowResponse) => {
  if (!(await verifyToken(req)))
    return res.status(401).json({ error: "invalid token" });
  try {
    const files = await github.repos.getArchiveLink({
      owner: OWNER,
      repo: REPO,
      archive_format: "zipball",
      ref: "master"
    });
    const zip = files.data as ArrayBuffer;
    res.setHeader("Content-Type", "application/octet-stream");
    return res.send(Buffer.from(zip));
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to read contents" });
  }
};
