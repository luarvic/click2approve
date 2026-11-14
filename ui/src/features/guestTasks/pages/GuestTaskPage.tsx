import { stores } from "@/app/rootStore";
import ApprovalRequestTaskResponseForm from "@/features/approvalRequests/components/ApprovalRequestTaskResponseForm";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import ApprovalRequestFileControls from "@/features/approvalRequests/components/ApprovalRequestFileControls";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import FormSection from "@/shared/components/forms/FormSection";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { createApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/utils/approvalRequestTaskClientAuditContext";
import { createGuestTaskApi, isGuestTaskUnavailable } from "@/features/guestTasks/api/guestTasksApi";
import GuestTaskDiscussion from "@/features/guestTasks/components/GuestTaskDiscussion";
import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadFile } from "@/features/userFiles/utils/downloaders";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import ActionResult from "@/shared/components/layout/ActionResult";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { FieldLimits } from "@/shared/config/fieldLimits";
import { Refresh } from "@/shared/config/application";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { signatureRule, textRule } from "@/shared/utils/formValidation";
import { notification } from "@/shared/utils/notifications";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { Button, Stack, Tab, Tabs } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

/** Reviews exactly one pending task using the capability delivered in its email. */
const GuestTaskPage = () => {
  const { taskGlobalId = "" } = useParams<{ taskGlobalId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.hash.slice(1)).get("token") ?? "";
  const api = useMemo(() => createGuestTaskApi(taskGlobalId, token), [taskGlobalId, token]);
  const tab = new URLSearchParams(location.search).get("tab") === "chat" ? "chat" : "task";
  const [started, setStarted] = useState(false);
  const [closed, setClosed] = useState(!token);
  const [submitted, setSubmitted] = useState(false);
  usePageTitle(closed ? (submitted ? "Decision submitted" : "Link no longer available") : "Review document");
  const [task, setTask] = useState<ApprovalRequestTask | null>(null);
  const [result, setResult] = useState<boolean | undefined>();
  const [comment, setComment] = useState("");
  const [legalName, setLegalName] = useState("");
  const [representationDetails, setRepresentationDetails] = useState("");
  const [signatureJson, setSignatureJson] = useState("");
  const [decisionError, setDecisionError] = useState(false);
  const [attachmentError, setAttachmentError] = useState(false);
  const action = useAsyncAction("guestTasks.action");
  const needsSignature = result === true && task?.isElectronicSignatureRequired === true;
  const validation = useFormValidation(
    { comment, legalName, representationDetails, signatureJson },
    {
      comment: textRule("Comment", FieldLimits.text, result === false || task?.isCommentRequired === true),
      legalName: needsSignature ? textRule("Legal name", FieldLimits.name, true) : undefined,
      representationDetails: textRule("Representation details", FieldLimits.details),
      signatureJson: needsSignature
        ? (value) => textRule("Signature", FieldLimits.signature, true)(value) ?? signatureRule(value)
        : undefined,
    },
    {
      legalName: "AssigneeLegalName",
      representationDetails: "AssigneeRepresentationDetails",
      signatureJson: "AssigneeSignatureJson",
    },
  );

  const close = useCallback(() => {
    setTask(null);
    setClosed(true);
    navigate(location.pathname, { replace: true });
  }, [navigate, location.pathname]);
  useEffect(() => {
    setTask(null);
    setStarted(false);
    setClosed(!token);
    setResult(undefined);
    setComment("");
    setLegalName("");
    setRepresentationDetails("");
    setSignatureJson("");
    if (token) setSubmitted(false);
  }, [token, taskGlobalId]);
  const onFailure = useCallback(
    (error: unknown) => {
      if (isGuestTaskUnavailable(error)) close();
      else notification.error(getApiErrorNotification(error));
    },
    [close],
  );
  const refresh = useCallback(async () => {
    try {
      const loaded = await api.getTask();
      setTask(loaded);
      return loaded;
    } catch (error) {
      onFailure(error);
      return null;
    }
  }, [api, onFailure]);
  useEffect(() => {
    if (!started || closed || Refresh.approvalRequestDetailsMs <= 0) return;
    const interval = window.setInterval(() => void refresh(), Refresh.approvalRequestDetailsMs);
    return () => window.clearInterval(interval);
  }, [started, closed, refresh]);

  const submit = () => {
    const valid = validation.validate();
    const missingDecision = typeof result !== "boolean";
    const missingAttachment = result === true && task?.isAttachmentRequired === true && !task.taskFiles?.length;
    setDecisionError(missingDecision);
    setAttachmentError(missingAttachment);
    if (!valid || missingDecision || missingAttachment) {
      notification.validationWarning();
      return;
    }
    void validation.run(() =>
      action.run(async () => {
        try {
          await api.request("POST", "/complete", {
            globalId: taskGlobalId,
            result,
            comment,
            ...(needsSignature
              ? {
                  assigneeLegalName: legalName,
                  assigneeRepresentationDetails: representationDetails,
                  assigneeSignatureJson: signatureJson,
                }
              : {}),
            clientAuditContext: createApprovalRequestTaskClientAuditContext(),
          });
          setSubmitted(true);
          close();
          showPersistenceSuccessNotification(PersistenceSuccessMessages.approvalDecisionSubmitted);
        } catch (error) {
          onFailure(error);
        }
      }),
    );
  };
  const upload = (uploads: File[]) =>
    void action.run(async () => {
      try {
        const data = new FormData();
        uploads.forEach((file) => data.append("uploads", file));
        await api.request<UserFile[]>("POST", "/attachments", data);
        await refresh();
        setAttachmentError(false);
      } catch (error) {
        onFailure(error);
      }
    });

  if (closed)
    return (
      <ActionResult
        title={submitted ? "Decision submitted" : "Link no longer available"}
        message="Sign up or sign in with the email address that received the request to access your documents and receipts."
        action={
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: "center" }} spacing={Forms.actionSpacing}>
            <MainActionButton onClick={() => navigate("/signUp")}>Sign up</MainActionButton>
            <Button component={Link} to="/signIn">
              Sign in
            </Button>
          </Stack>
        }
      />
    );

  if (!started)
    return (
      <ActionResult
        title="Review document"
        message="Open your assigned documents and record your response. No account is required."
        action={
          <MainActionButton
            loading={action.isRunning}
            onClick={() =>
              void action.run(async () => {
                if (await refresh()) setStarted(true);
              })
            }
          >
            Continue to document
          </MainActionButton>
        }
      />
    );

  if (!task) return null;
  const download = (path: string, file: UserFile) =>
    void downloadFile(file, () =>
      api.request<string>("GET", path).catch((error) => {
        onFailure(error);
        return null;
      }),
    );
  const discussionsAreEnabled = stores.applicationConfigurationStore.discussionsAreEnabled;
  return (
    <NarrowContent>
      <PageBreadcrumbs items={[{ label: task.title }]} />
      <Tabs
        value={tab}
        variant="scrollable"
        scrollButtons={false}
        aria-label="Task sections"
        onChange={(_, value: string) =>
          navigate({ pathname: location.pathname, search: value === "chat" ? "?tab=chat" : "", hash: location.hash })
        }
      >
        <Tab label="Task" value="task" />
        {discussionsAreEnabled && <Tab label="Chat" value="chat" />}
      </Tabs>
      {tab === "task" && (
        <Stack sx={Forms.tabContentSx}>
          <Stack spacing={Forms.cardStackSpacing}>
            <ApprovalRequestTaskSummaryBlock
              task={task}
              expandable
              participant="assignee"
              showRequester
              showOrganization
              onDownloadFile={(file) => download(`/requestAttachments/${file.globalId}/downloadBase64`, file)}
            />
            <ApprovalRequestTaskResponseForm
              action={task.action}
              result={result}
              onResultChange={(value) => {
                setResult(value);
                setDecisionError(false);
                setAttachmentError(false);
              }}
              decisionError={decisionError}
              attachmentError={attachmentError}
              disabled={action.isRunning}
              comment={comment}
              commentError={validation.message("comment")}
              onCommentChange={setComment}
              requiresElectronicSignature={needsSignature}
              legalName={legalName}
              onLegalNameChange={setLegalName}
              representationDetails={representationDetails}
              onRepresentationDetailsChange={setRepresentationDetails}
              signatureJson={signatureJson}
              onSignatureChange={setSignatureJson}
              showRepresentationDetails
              signatureErrors={{
                legalName: validation.message("legalName") ?? "",
                signature: validation.message("signatureJson") ?? "",
                representationDetails: validation.message("representationDetails"),
              }}
              attachments={
                stores.applicationConfigurationStore.taskAttachmentsAreEnabled && (
                  <FormSection title="Files attached to this decision">
                    <ApprovalRequestFileControls
                      files={task.taskFiles ?? []}
                      disabled={action.isRunning}
                      uploading={action.isRunning}
                      onUpload={upload}
                      onDownload={(file) => download(`/attachments/${file.globalId}/downloadBase64`, file)}
                      onRemove={(index) =>
                        void action.run(async () => {
                          try {
                            await api.request("DELETE", `/attachments/${task.taskFiles![index].globalId}`);
                            await refresh();
                          } catch (error) {
                            onFailure(error);
                          }
                        })
                      }
                    />
                  </FormSection>
                )
              }
            />
          </Stack>
          <ApprovalRequestActionBar
            closeLabel="Close"
            onClose={() => {
              setStarted(false);
            }}
          >
            <MainActionButton onClick={submit} loading={action.isRunning}>
              Complete
            </MainActionButton>
          </ApprovalRequestActionBar>
        </Stack>
      )}
      {discussionsAreEnabled && (
        <div hidden={tab !== "chat"}>
          <GuestTaskDiscussion api={api} task={task} onFailure={onFailure} onClose={() => setStarted(false)} />
        </div>
      )}
    </NarrowContent>
  );
};

export default GuestTaskPage;
