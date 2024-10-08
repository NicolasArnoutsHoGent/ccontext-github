// app/api/run-ccontext/route.ts

import { NextRequest } from "next/server";
import { TempEnvManager } from "@/lib/temp-env-manager";
import { getUserInfo, sanitizeInput } from "@/lib/helpers";
import { spawn } from "child_process";
import { Readable } from "stream";

const tempEnvManager = new TempEnvManager();

export async function GET(req: NextRequest) {
  const userInfo = await getUserInfo(req);
  const envId = req.nextUrl.searchParams.get("envId");
  const maxTokens = req.nextUrl.searchParams.get("maxTokens");
  const includes = req.nextUrl.searchParams.get("includes");
  const excludes = req.nextUrl.searchParams.get("excludes");

  if (!envId) {
    return new Response("Missing envId", { status: 400 });
  }

  const parsedMaxTokens = 10000;
  if (isNaN(parsedMaxTokens) || parsedMaxTokens <= 0) {
    return new Response("Invalid maxTokens value", { status: 400 });
  }

  const repository = await tempEnvManager.getRepository(envId, userInfo.id);

  if (!repository) {
    return new Response("Repository not found", { status: 404 });
  }

  const repoPath = tempEnvManager.getRepoPath(userInfo.id, repository.slug);

  const sanitizedIncludes = sanitizeInput(includes || "");
  const sanitizedExcludes = sanitizeInput(excludes || "");

  console.log("sanitizedIncludes", sanitizedIncludes);
  console.log("sanitizedExcludes", sanitizedExcludes);

  const cmdString = `ccontext -m 10000000 ${
    sanitizedExcludes ? `-e "${sanitizedExcludes}"` : ""
  } ${sanitizedIncludes ? `-i "${sanitizedIncludes}"` : ""} -gm -g`;

  const stream = new ReadableStream({
    start(controller) {
      const process = spawn(cmdString, {
        cwd: repoPath,
        shell: true,
      });

      process.stdout.on("data", (data) => {
        controller.enqueue(
          `data: ${JSON.stringify({ output: data.toString() })}\n\n`
        );
      });

      process.stderr.on("data", (data) => {
        controller.enqueue(
          `data: ${JSON.stringify({ output: `Error: ${data.toString()}` })}\n\n`
        );
      });

      process.on("close", (code) => {
        if (code === 0) {
          controller.enqueue(
            `data: ${JSON.stringify({ status: "success" })}\n\n`
          );
        } else {
          controller.enqueue(
            `data: ${JSON.stringify({ status: "error", code })}\n\n`
          );
        }
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
