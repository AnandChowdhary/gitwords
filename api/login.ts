import { NowRequest, NowResponse } from "@now/node";
import { github } from "../common/octokit";
import { OWNER, REPO, PASSWORD_PATH, SALT_ROUNDS } from "../common/config";
import { compare } from "bcrypt";

export default async (req: NowRequest, res: NowResponse) => {
  const password = req.body.password;
  try {
    const correctPassword = Buffer.from(
      ((
        await github.repos.getContents({
          owner: OWNER,
          repo: REPO,
          path: PASSWORD_PATH
        })
      ).data as any).content,
      "base64"
    )
      .toString("utf8")
      .replace(/\r?\n|\r/, "")
      .trim();
    const check = await compare(password, correctPassword);
    if (check) return res.json({ success: true });
    return res
      .status(401)
      .json({ error: "invalid password", password, correctPassword });
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to read contents" });
  }
};
