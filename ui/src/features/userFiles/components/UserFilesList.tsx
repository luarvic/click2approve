import { stores } from "@/app/rootStore";
import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadUserFile } from "@/features/userFiles/utils/downloaders";
import FileNameLink from "@/shared/components/files/FileNameLink";
import FileRow from "@/shared/components/files/FileRow";
import { Lists, StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface UserFilesListProps {
  userFiles?: UserFile[];
  direction: "row" | "row-reverse" | "column" | "column-reverse" | undefined;
  sx?: SxProps<Theme>;
  onDownload?: (userFile: UserFile) => void;
}

const userFileLinkSx: SxProps<Theme> = {
  alignSelf: "stretch",
  textAlign: "left",
};

const userFileRowSx: SxProps<Theme> = {
  columnGap: StackSpacing.tight,
};

const UserFilesList: React.FC<UserFilesListProps> = ({ userFiles, direction, sx, onDownload }) => {
  return (
    <Stack
      spacing={Lists.itemSpacing}
      direction={direction}
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={[Lists.overflowHiddenSx, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {userFiles &&
        userFiles.map((userFile) => (
          <FileRow key={userFile.globalId} sx={userFileRowSx}>
            <FileNameLink
              fileName={userFile.name}
              onClick={() => {
                if (onDownload) {
                  onDownload(userFile);
                } else if (stores.tenantStore.currentTenantGlobalId) {
                  downloadUserFile(stores.tenantStore.currentTenantGlobalId, userFile);
                }
              }}
              sx={userFileLinkSx}
            />
          </FileRow>
        ))}
    </Stack>
  );
};

export default UserFilesList;
