import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToReadableStream } from "react-dom/server";
import { Tooltip } from "../../src/components/ui/tooltip";

for (const content of [undefined, "Explains the control"]) {
  test(`tooltip resolves a delayed trigger with ${content ? "explicit" : "default"} content`, async () => {
    const errors: unknown[] = [];
    const trigger = (
      <button aria-label="Help" type="button">
        ?
      </button>
    );
    const stream = await renderToReadableStream(
      <Tooltip content={content}>{Promise.resolve(trigger)}</Tooltip>,
      {
        onError: (error) => {
          errors.push(error);
        },
      },
    );
    const html = await new Response(stream).text();

    assert.deepEqual(errors, []);
    assert.equal(html, '<button aria-label="Help" type="button">?</button>');
  });
}

test("tooltip preserves a direct trigger and supplies its accessible label", async () => {
  const stream = await renderToReadableStream(
    <Tooltip content="Help">
      <button type="button">?</button>
    </Tooltip>,
  );

  assert.equal(
    await new Response(stream).text(),
    '<button type="button" aria-label="Help">?</button>',
  );
});
