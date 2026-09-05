import { stores } from "@/app/rootStore";
import {
  listRequestDiscussion,
  listTaskDiscussion,
  sendRequestDiscussion,
  sendTaskDiscussion,
} from "@/features/discussions/api/discussionsApi";
import { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { UserFile } from "@/features/userFiles/models/userFile";
import { Refresh } from "@/shared/config/application";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseDiscussionMessagesOptions {
  requestGlobalId: string;
  taskGlobalId?: string;
  tenantGlobalId: string | null;
}

export const useDiscussionMessages = ({
  requestGlobalId,
  taskGlobalId,
  tenantGlobalId,
}: UseDiscussionMessagesOptions) => {
  const [messages, setMessages] = useState<DiscussionMessage[] | null>(null);
  const requestVersion = useRef(0);
  const loadLoader = taskGlobalId
    ? ActionLoaders.discussions.loadForTask(taskGlobalId)
    : ActionLoaders.discussions.loadForRequest(requestGlobalId);
  const sendAction = useAsyncAction(
    taskGlobalId
      ? ActionLoaders.discussions.sendForTask(taskGlobalId)
      : ActionLoaders.discussions.sendForRequest(requestGlobalId),
  );

  const load = useCallback(async () => {
    if (!tenantGlobalId) {
      return;
    }

    const version = ++requestVersion.current;
    stores.commonStore.updateActionLoadingCounter(loadLoader, 1);
    try {
      const loadedMessages = taskGlobalId
        ? await listTaskDiscussion(tenantGlobalId, taskGlobalId)
        : await listRequestDiscussion(tenantGlobalId, requestGlobalId);
      if (version === requestVersion.current && loadedMessages) {
        setMessages(loadedMessages);
      }
    } finally {
      stores.commonStore.updateActionLoadingCounter(loadLoader, -1);
    }
  }, [loadLoader, requestGlobalId, taskGlobalId, tenantGlobalId]);

  useEffect(() => {
    void load();
    if (Refresh.discussionsMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => void load(), Refresh.discussionsMs);
    return () => window.clearInterval(intervalId);
  }, [load]);

  const send = useCallback(
    async (body: string, files: UserFile[]): Promise<boolean> => {
      if (!tenantGlobalId || (!body.trim() && files.length === 0)) {
        return false;
      }

      const message = await sendAction.run(() =>
        taskGlobalId
          ? sendTaskDiscussion(
              tenantGlobalId,
              taskGlobalId,
              body,
              files.map((file) => file.globalId),
            )
          : sendRequestDiscussion(
              tenantGlobalId,
              requestGlobalId,
              body,
              files.map((file) => file.globalId),
            ),
      );
      if (!message) {
        return false;
      }

      requestVersion.current += 1;
      setMessages((currentMessages) => [...(currentMessages ?? []), message]);
      return true;
    },
    [requestGlobalId, sendAction, taskGlobalId, tenantGlobalId],
  );

  return { isSending: sendAction.isRunning, messages, send };
};
