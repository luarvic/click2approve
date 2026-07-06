import { Link, Stack } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  LIST_ITEM_SPACING,
  LIST_OVERFLOW_HIDDEN_SX,
} from "../../data/constants";
import { IUserFile } from "../../models/userFile";
import { downloadUserFile } from "../../utils/downloaders";

interface IUserFilesListProps {
  userFiles?: IUserFile[];
  direction: "row" | "row-reverse" | "column" | "column-reverse" | undefined;
  sx?: SxProps<Theme>;
}

const UserFilesList: React.FC<IUserFilesListProps> = ({
  userFiles,
  direction,
  sx,
}) => {
  return (
    <Stack
      spacing={LIST_ITEM_SPACING}
      direction={direction}
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={[LIST_OVERFLOW_HIDDEN_SX, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {userFiles &&
        userFiles.map((userFile, index) => (
          <Link
            key={index}
            component="button"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              downloadUserFile(userFile);
            }}
          >
            {userFile.name}
          </Link>
        ))}
    </Stack>
  );
};

export default UserFilesList;
