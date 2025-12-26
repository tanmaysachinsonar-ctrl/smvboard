import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

/**
 * Example API route to create/get transactions.
 * NOTE: This route assumes an auth middleware that provides user & orgId.
 * For initial scaffold it's unauthenticated — plug Supabase auth server-side checks.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { accountId, amount, currency = "EUR", date, type, description, receiptUrl, createdById } = req.body;
    if (!accountId || !amount || !date || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const txn = await prisma.transaction.create({
        data: {
          orgId: "org_placeholder", // replace with actual orgId from auth
          accountId,
          amount: Number(amount),
          currency,
          date: new Date(date),
          type,
          description,
          receiptUrl,
          createdById: createdById || "user_placeholder"
        }
      });

      // optional: update cached balance (simplified)
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: type === "INCOME" ? Number(amount) : -Number(amount) } as any }
      });

      res.status(201).json(txn);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
    return;
  }

  // GET: list recent transactions (simple)
  if (req.method === "GET") {
    try {
      const txns = await prisma.transaction.findMany({
        where: { orgId: "org_placeholder" },
        orderBy: { date: "desc" },
        take: 50
      });
      res.status(200).json(txns);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}