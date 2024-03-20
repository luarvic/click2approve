import { Link, Stack, SxProps } from "@mui/material";
import { IUserFile } from "../../models/UserFile";
import { downloadUserFile } from "../../utils/Downloaders";

interface IListUserFilesProps {
  userFiles: IUserFile[];
  sx?: SxProps;
}

export const ListUserFiles: React.FC<IListUserFilesProps> = ({
  userFiles,
  sx,
}) => {
  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={{ ...sx }}
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
