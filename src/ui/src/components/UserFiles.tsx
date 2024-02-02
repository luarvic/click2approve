import { observer } from "mobx-react-lite";
import React, { useContext, useEffect } from "react";
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon";
import {
  Checkbox,
  Container,
  Grid,
  Image,
  Popup,
  PopupContent,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "semantic-ui-react";
import { IUserFile } from "../models/UserFile";
import { userFileStoreContext } from "../stores/UserFileStore";
import { downloadFileBase64 } from "../utils/ApiClient";
import Buttons from "./Buttons";

export const UserFiles = () => {
  const userFileStore = useContext(userFileStoreContext);
  const { userFiles, loadUserFiles, handleUserFileCheckbox } = userFileStore;

  const getDefaultExtensionType = (extention: string) => {
    const styledIcons = Object.keys(
      defaultStyles
    ) as Array<DefaultExtensionType>;
    return styledIcons.find(
      (key) => key.toString() === extention.replace(".", "").toLowerCase()
    );
  };

  const loadData = () => {
    loadUserFiles();
  };

  const handleDownloadClick = async (userFile: IUserFile) => {
    const base64String = await downloadFileBase64(userFile.id);
    const a = document.createElement("a");
    a.hidden = true;
    a.href = base64String;
    a.setAttribute("download", userFile.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Container>
      <Buttons />
      <Grid centered columns={1}>
        <Grid.Column>
          <Table celled compact definition>
            <TableHeader fullWidth>
              <TableRow>
                <TableHeaderCell></TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Preview</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell>Downloads</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userFiles.map((userFile: IUserFile) => (
                <TableRow
                  key={userFile.id}
                  positive={
                    (Date.now() - userFile.createdDate.getTime()) / 1000 < 60
                  }
                >
                  <TableCell collapsing>
                    <Checkbox
                      id={userFile.id}
                      onChange={(event, data) =>
                        handleUserFileCheckbox(userFile.id, data.checked!)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="fileicon">
                      {getDefaultExtensionType(userFile.type) ? (
                        <FileIcon
                          extension={userFile.type}
                          {...defaultStyles[
                            getDefaultExtensionType(userFile.type)!
                          ]}
                        />
                      ) : (
                        userFile.type
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Popup
                      trigger={
                        <Image src={userFile.thumbnail} rounded size="mini" />
                      }
                      wide
                    >
                      <PopupContent>
                        <Image src={userFile.thumbnail} />
                      </PopupContent>
                    </Popup>
                  </TableCell>
                  <TableCell>{userFile.name}</TableCell>
                  <TableCell>{userFile.createdDate.toLocaleString()}</TableCell>
                  <TableCell>{userFile.downloadCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default observer(UserFiles);
