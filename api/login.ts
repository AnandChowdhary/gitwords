import { NowRequest, NowResponse } from "@now/node";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { getPassword, getSecret } from "../common/secrets";
import { JWT_EXPIRY } from "../common/config";

export default async (req: NowRequest, res: NowResponse) => {
  const password = req.body.password;
  delete req.body.password;
  try {
    const correctPassword = await getPassword();
    let check = await compare(password, correctPassword);
    if (correctPassword === "" && req.body.password === "") check = true;
    if (check)
      return res.json({
        success: true,
        token: sign(req.body, await getSecret(), {
          expiresIn: JWT_EXPIRY
        })
      });
    return res.status(401).json({ error: "invalid password" });
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "unable to read contents" });
  }
};
