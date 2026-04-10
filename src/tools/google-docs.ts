/**
 * Google Docs API — create doc, manage tabs, write content.
 * Replaces the gws CLI from systems-infrastructure.md.
 * Requires GOOGLE_SERVICE_ACCOUNT_JSON env var (the JSON key as a string).
 */

import { google } from "googleapis";

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

const docs = google.docs({ version: "v1", auth: getAuth() });
const drive = google.drive({ version: "v3", auth: getAuth() });

/**
 * Create a new Google Doc and move it to a Drive folder.
 */
export async function createDoc(
  title: string,
  folderId?: string
): Promise<{ docId: string; docUrl: string }> {
  // Create the doc
  const doc = await docs.documents.create({
    requestBody: { title },
  });

  const docId = doc.data.documentId!;
  const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

  // Move to folder if specified
  if (folderId) {
    try {
      // Get current parents
      const file = await drive.files.get({
        fileId: docId,
        fields: "parents",
      });

      const previousParents = (file.data.parents || []).join(",");

      await drive.files.update({
        fileId: docId,
        addParents: folderId,
        removeParents: previousParents,
        fields: "id, parents",
      });
    } catch (err) {
      console.error(`[Google Docs] Failed to move to folder ${folderId}:`, err);
      // Doc still created, just not in the right folder
    }
  }

  console.log(`[Google Docs] Created: ${docUrl}`);
  return { docId, docUrl };
}

/**
 * Append text content to a Google Doc.
 */
export async function appendToDoc(docId: string, content: string): Promise<void> {
  // Get current end index
  const doc = await docs.documents.get({ documentId: docId });
  const body = doc.data.body;
  const endIndex = body?.content?.[body.content.length - 1]?.endIndex || 1;

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: endIndex - 1 },
            text: content,
          },
        },
      ],
    },
  });
}

/**
 * Replace all content in a Google Doc.
 */
export async function replaceDocContent(docId: string, content: string): Promise<void> {
  // Get current end index
  const doc = await docs.documents.get({ documentId: docId });
  const body = doc.data.body;
  const endIndex = body?.content?.[body.content.length - 1]?.endIndex || 1;

  const requests: Array<Record<string, unknown>> = [];

  // Delete existing content (if any beyond the initial newline)
  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: { startIndex: 1, endIndex: endIndex - 1 },
      },
    });
  }

  // Insert new content
  requests.push({
    insertText: {
      location: { index: 1 },
      text: content,
    },
  });

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests },
  });
}

/**
 * Write the final script to a Google Doc with proper formatting.
 */
export async function writeFinalScript(
  docId: string,
  brandName: string,
  hooks: string,
  body: string,
  giveaway: string
): Promise<void> {
  const content =
    `${brandName.toUpperCase()} — LAUNCH SCRIPT\n\n` +
    `═══════════════════════════════\n` +
    `${hooks}\n\n` +
    `═══════════════════════════════\n` +
    `BODY:\n` +
    `═══════════════════════════════\n` +
    `${body}\n\n` +
    `═══════════════════════════════\n` +
    `${giveaway}\n`;

  await replaceDocContent(docId, content);
  console.log(`[Google Docs] Final script written to ${docId}`);
}
