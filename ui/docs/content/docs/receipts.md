---
title: Approval receipts and document file verification
description: Open a record of document approval decisions and signatures. Share a receipt through a verification link and check whether a file matches the recorded copy.
---
# Approval receipts and document file verification {#receipts-and-verification}

A **receipt** is a record Click2Approve creates when a request finishes. It preserves the request details, outcome, and participants' recorded actions, including signatures where provided. Use it to see who acted and what result was recorded.

You can share a receipt through a verification link. The person with the link can review the record and check whether their copy of a document matches a file recorded on the receipt.

!!! info "Who can manage receipts?"
    Only the user a receipt is issued to can open or delete it in the workspace and manage its verification links. This applies in both Personal and organizations; Owners and Admins cannot open other people's receipts through their role.

The requester and every assignee who received a task get a receipt when the request completes, is canceled, or is replaced by a new revision. Each person receives one receipt per workspace and request revision, even if they have several tasks or are also the requester. A task does not have to be completed to receive a receipt; its recorded status distinguishes an assignment from a completed action. Steps that never produced a task do not issue assignee receipts.

## Open a receipt

Open **Receipts** in the workspace where you sent the request or completed your task, then select the receipt for that request. The **Receipt** card header includes its short number, matching request and task card headers. The card shows its full ID and date, followed by **Request** and **Task** sections with the recorded details, outcomes, participants, actions, and signatures where present.

The **Request** and **Task** section headings include their short numbers in both workspace receipts and shared verification pages. Full request and task IDs remain in the recorded details when available.

Receipt dates use your local date and time without seconds. Empty fields and the first revision number are hidden.

When printing, Request and Task sections can continue across pages. Section headings stay with their first row, and individual detail rows and signatures stay together when they fit on a page.

A receipt preserves the recorded context of the completed work. Participant-specific visibility can limit the steps included in a receipt. A receipt is separate from the live request.

## Create a verification link

1. Open a receipt you can manage.
2. Select **Share**.
3. Choose **New link**, set **Expires**, and create the link.
4. Select the created link in the list to open its verification URL, then copy and share it with the intended recipient.

The QR code inside the receipt card opens the same verification link. Select the Click2Approve logo or brand name above the card to open the home page.

!!! warning "Anyone with the link can view the receipt"
    An active verification link opens the receipt without requiring workspace membership. Review it before sharing: its contents may include names, decisions, and signatures.

## Verify a file

Open a receipt in your workspace or an active verification link and choose **Verify file**. Select your copy of the document. Your browser calculates its **SHA-256 hash**, a value based on the file's contents. Click2Approve compares that value with the hashes recorded on the receipt and shows whether the file matches a request file or a participant's response attachment. This check reads your selected file in the browser; it does not upload that copy.

For example, if someone sends you an approved proposal and its receipt link, open the link and use **Verify file** to check the proposal. A file with changed contents will not match the recorded hash, even if its filename is the same.

The result appears above **Verify file**. **File verified** identifies the matching attachment and its request or task. **File does not match** means no recorded file has the same hash. Check that you selected the correct version and try again.

Verification uses the file metadata and hashes preserved in the receipt. It still works after the original attachments have been removed; retaining a receipt does not keep those stored attachments.

A match confirms that the file contents match a recorded file. It does not assess the document's claims or independently verify the signer's identity.

## Stop sharing

On **Share**, select the link, choose **Remove**, and confirm when access is no longer needed. An expired or revoked link no longer provides the receipt. Creating another link does not extend an existing link's expiry.

If verification fails, ask the receipt owner for a current link. Public verification links provide access to that receipt, not to the organization's requests, tasks, or directories.

## Receipt retention

Background cleanup removes receipts and their verification links according to the receipt workspace's [retention policy](retention.md), measured from receipt creation:

| Plan | Receipt retention |
| --- | --- |
| Personal Free | Five years |
| Business Trial | One month |
| Paid plans | The configured **Requests and receipts** period, including **Never delete** |

A personal assignee's receipt follows their Personal workspace's policy, independently of the requesting organization's plan. Changing plans changes the policy for existing receipts that have not yet been removed. Deleting the original request does not delete its receipts. Workspace removal and payment-related cleanup can still remove receipts earlier.

A verification link is not an independent backup of its receipt. Revoking a link stops sharing without deleting the receipt.

## Delete your receipt

Select **Delete** on your receipt, then confirm in **Delete receipt**. This permanently removes your receipt and all its verification links. It does not delete the original request or receipts issued to other participants. Owners and Admins can delete only receipts issued to themselves.

To stop sharing while keeping your receipt, revoke its verification links instead.
