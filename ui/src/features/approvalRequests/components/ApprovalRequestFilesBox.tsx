import UserFilesList from "@/features/userFiles/components/UserFilesList";
import { UserFile } from "@/features/userFiles/models/userFile";
import CommentPaper from "@/shared/components/papers/CommentPaper";

interface ApprovalRequestFilesBoxProps {
  userFiles?: UserFile[];
}

const ApprovalRequestFilesBox: React.FC<ApprovalRequestFilesBoxProps> = ({
  userFiles,
}) => {
  return (
    <CommentPaper>
      <UserFilesList userFiles={userFiles} direction="column" />
    </CommentPaper>
  );
};

export default ApprovalRequestFilesBox;
