import { Link, Stack, SxProps } from "@mui/material";
import { IUserFile } from "../../models/userFile";
import { downloadUserFile } from "../../utils/downloaders";

interface IUserFilesListProps {
  userFiles?: IUserFile[];
  direction: "row" | "row-reverse" | "column" | "column-reverse" | undefined;
  sx?: SxProps;
}

const UserFilesList: React.FC<IUserFilesListProps> = ({
  userFiles,
  direction,
  sx,
}) => {
  return (
    <Stack
      spacing={1}
      direction={direction}
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={{ overflow: "hidden", ...sx }}
    >
      {userFiles &&
        userFiles.map((userFile, index) => (
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

export default UserFilesList;
