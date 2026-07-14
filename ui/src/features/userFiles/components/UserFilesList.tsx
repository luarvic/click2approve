import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadUserFile } from "@/features/userFiles/utils/downloaders";
import { Lists } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Link, Stack } from "@mui/material";
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

const UserFilesList: React.FC<UserFilesListProps> = ({
  userFiles,
  direction,
  sx,
  onDownload,
}) => {
  return (
    <Stack
      spacing={Lists.itemSpacing}
      direction={direction}
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={[Lists.overflowHiddenSx, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {userFiles &&
        userFiles.map((userFile, index) => (
          <Link
            key={index}
            component="button"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              if (onDownload) {
                onDownload(userFile);
              } else {
                downloadUserFile(userFile);
              }
            }}
            sx={userFileLinkSx}
          >
            {userFile.name}
          </Link>
        ))}
    </Stack>
  );
};

export default UserFilesList;
