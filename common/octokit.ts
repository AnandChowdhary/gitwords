import { Octokit } from "@octokit/rest";

export const github = new Octokit({
  auth: process.env.FINDING_ANAND_ACCESS_TOKEN,
  userAgent: "AnandChowdhary/gitwords"
});
