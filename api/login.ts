import { NowRequest, NowResponse } from "@now/node";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { getPassword, getSecret } from "../common/secrets";

export default async (req: NowRequest, res: NowResponse) => {
  const password = req.body.password;
  delete req.body.password;
  try {
    const correctPassword = await getPassword();
    const check = await compare(password, correctPassword);
    if (check)
      return res.json({
        success: true,
        token: sign(req.body, await getSecret())
      });
    return res
      .status(401)
      .json({ error: "invalid password", password, correctPassword });
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to read contents" });
  }
};
