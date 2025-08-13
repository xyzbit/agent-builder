import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { refId } = params;

  if (!refId || isNaN(Number(refId))) {
    return new Response("Invalid reference ID", { status: 400 });
  }

  try {
    const { refsStorage } = await import("~/lib/.server/refs.storage");
    
    const reference = await refsStorage.getReferenceById(Number(refId));
    if (!reference) {
      return new Response("Reference not found", { status: 404 });
    }

    return new Response(reference.content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `inline; filename="reference_${refId}.mdc"`
      }
    });
  } catch (error) {
    console.error("Error serving reference:", error);
    return new Response("Error serving file", { status: 500 });
  }
};

