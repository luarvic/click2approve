import { Link, Stack, SxProps } from "@mui/material";
import { IUserFile } from "../../models/userFile";
import { downloadUserFile } from "../../utils/downloaders";

interface IUserFilesListProps {
  userFiles: IUserFile[];
  sx?: SxProps;
}

export const UserFilesList: React.FC<IUserFilesListProps> = ({
  userFiles,
  sx,
}) => {
  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={{ ...sx, overflow: "hidden" }}
    >
      {userFiles.map((userFile, index) => (
        <Link
          key={index}
          component="button"
          onClick={() => downloadUserFile(userFile)}
        >
          {userFile.name}
        </Link>
      ))}
    </Stack>
  );
};
