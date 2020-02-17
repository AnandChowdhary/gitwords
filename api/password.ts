import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO, PASSWORD_PATH, UPDATE_MESSAGE } from "../common/config";
import { verifyToken, getPassword } from "../common/secrets";
import { compare } from "bcrypt";

export default async (req: NowRequest, res: NowResponse) => {
  if (!(await verifyToken(req)))
    return res.status(401).json({ error: "invalid token" });
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  try {
    const truePassword = await getPassword();
    const check = await compare(currentPassword, truePassword);
    if (check) {
      const sha = ((await github.repos.getContents({
        owner: OWNER,
        repo: REPO,
        path: PASSWORD_PATH
      })) as any).data.sha;
      const content = Buffer.from(newPassword).toString("base64");
      await github.repos.createOrUpdateFile({
        owner: OWNER,
        repo: REPO,
        message: UPDATE_MESSAGE,
        path: PASSWORD_PATH,
        content,
        sha
      });
      return res.json({ success: true });
    }
    return res.status(401).json({ error: "invalid password" });
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to read contents" });
  }
};
