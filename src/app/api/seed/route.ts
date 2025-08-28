import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST() {
  // run prisma seed programmatically (dev-only convenience)
  const cmd = `npx prisma db seed`;
  const cwd = path.resolve(process.cwd());
  await new Promise<void>((res, rej)=>exec(cmd, { cwd }, (e)=> e ? rej(e) : res()));
  return NextResponse.json({ ok:true });
}
