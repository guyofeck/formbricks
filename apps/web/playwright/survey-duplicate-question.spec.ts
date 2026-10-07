import { createId } from "@paralleldrive/cuid2";
import { expect } from "@playwright/test";
import { prisma } from "@formbricks/database";
import { test } from "./lib/fixtures";

test("Duplicate question inserts an independent copy directly below the original", async ({
  page,
  users,
}) => {
  const user = await users.create();
  const question = (headline: string) => ({
    id: createId(),
    type: "openText" as const,
    headline: { default: headline },
    required: true,
    inputType: "text" as const,
    charLimit: { enabled: false },
  });
  const original = question("Original question");
  const following = question("Following question");
  const blocks = [
    { id: createId(), name: "Block 1", elements: [question("Earlier block question")] },
    { id: createId(), name: "Block 2", elements: [original, following] },
  ];
  const survey = await prisma.survey.create({
    data: {
      workspaceId: user.workspaceId!,
      createdBy: user.id,
      name: "Question duplication regression",
      status: "draft",
      type: "link",
      blocks,
      endings: [{ id: createId(), type: "endScreen", headline: { default: "Thank you!" } }],
    },
  });

  await user.login();
  await page.goto(`/workspaces/${user.workspaceId}/surveys/${survey.id}/edit`);
  const originalCard = page.locator(`[id="${original.id}"]`);
  await expect(originalCard).toBeVisible();
  await originalCard.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole("menuitem", { name: "Duplicate question", exact: true }).click();
  await expect(page.getByText("Question duplicated.", { exact: true })).toBeVisible();

  const questionHeaders = page.getByRole("button", { name: "Toggle question details", exact: true });
  await expect(questionHeaders.locator("h3")).toHaveText([
    "Earlier block question",
    "Original question",
    "Original question",
    "Following question",
  ]);
  const duplicateId = await questionHeaders.nth(2).locator("../..").getAttribute("id");
  expect(duplicateId).toBeTruthy();
  expect(duplicateId).not.toBe(original.id);

  await page.getByRole("button", { name: "Save as draft", exact: true }).click();
  await expect(page.getByText("Changes saved.", { exact: true })).toBeVisible();
  const saved = await prisma.survey.findUniqueOrThrow({ where: { id: survey.id } });
  expect(saved.blocks[0]).toEqual(blocks[0]);
  const savedQuestions = saved.blocks[1].elements;
  expect(savedQuestions.map((element) => element.id)).toEqual([original.id, duplicateId, following.id]);
  expect(savedQuestions[1]).toEqual({ ...savedQuestions[0], id: duplicateId });
});
