import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { UsernameToProfile } from "../../../server/lib/minecraft";
import { getDiscordUser } from "../../../server/lib/utils";
import adminMiddleware from "../../../utils/adminMiddleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ign } = req.query;

  if (typeof ign !== "string") {
    return res.status(400).json({
      error: "Invalid IGN",
    });
  }

  const profile = await UsernameToProfile(ign);

  if (!profile) {
    return res.status(404).json({
      error: "Account not found",
    });
  }

  const tsmpAcct = await prisma.user.findFirst({
    where: {
      minecraftUUID: profile.id,
    },
    include: {
      accounts: true,
    },
  });

  if (!tsmpAcct) {
    return res.status(404).json({
      error: "TSMP account not found",
    });
  }

  const discord = getDiscordUser(tsmpAcct.accounts);

  return res.status(200).json({
    minecraftUUID: profile.id,
    minecraftUsername: profile.name,
    discordId: discord?.id ?? null,
  });
}

export default adminMiddleware(handler);
