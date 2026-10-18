# Receipts and verification

Receipts preserve completed request snapshots and let you share them through verification links.

!!! info "Who can manage receipts?"
    Manage your own receipts in Personal. In an organization, Owners and Admins manage receipts and verification links.

## Open a receipt

Open **Receipts** in the relevant workspace and select a completed request snapshot. Review its request details, outcome, participants, recorded task actions, and signatures where present.

A receipt preserves the recorded context of the completed work. Participant-specific visibility can limit the steps included in a receipt. A receipt is separate from the live request.

## Create a verification link

1. Open a receipt you can manage.
2. Select **Share**.
3. Choose **New link**, set **Expires**, and create the link.
4. Select the created link in the list to open its verification URL, then copy and share it with the intended recipient.

!!! warning "Anyone with the link can view the receipt"
    An active verification link opens the receipt without requiring workspace membership. Review it before sharing: its contents may include names, decisions, and signatures.

## Verify a file

Open an active verification link and choose **Verify file**. Select your copy of the document. Click2Approve compares its SHA-256 hash with the files recorded on the receipt and shows whether it matches a request file or a participant's response attachment.

A match confirms that the file contents match a recorded file. It does not assess the document's claims or independently verify the signer's identity.

## Stop sharing

On **Share**, select the link, choose **Remove**, and confirm when access is no longer needed. An expired or revoked link no longer provides the receipt. Creating another link does not extend an existing link's expiry.

If verification fails, ask the receipt owner for a current link. Public verification links provide access to that receipt, not to the organization's requests, tasks, or directories.

## Deleting receipts

Use **Delete receipt** only when you intend to remove the snapshot. Check your organization's recordkeeping needs and [retention settings](retention.md) first. A verification link is not an independent backup of its receipt.
