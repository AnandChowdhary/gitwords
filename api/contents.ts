import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO } from "../common/config";
import { verifyToken } from "../common/secrets";
import { Base64 } from "js-base64";

export default async (req: NowRequest, res: NowResponse) => {
  if (!(await verifyToken(req)))
    return res.status(401).json({ error: "invalid token" });
  let path = req.query.path;
  if (typeof path !== "string" || !path) path = "/";
  try {
    const files = await github.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path
    });
    if (Array.isArray(files.data)) return res.json(files.data);
    return res.json({
      ...files.data,
      safeContent: files.data.content ? Base64.decode(files.data.content) : ""
    });
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to read contents" });
  }
};
