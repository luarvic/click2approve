import { observer } from "mobx-react-lite";
import React, { useContext, useEffect } from "react";
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon";
import {
  Checkbox,
  Container,
  Grid,
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
import prettyBytes from "pretty-bytes";

// Table with user files.
export const UserFiles = () => {
  const userFileStore = useContext(userFileStoreContext);
  const { userFiles, loadUserFiles, handleUserFileCheckbox } = userFileStore;

  const getDefaultExtensionType = (extension: string) => {
    const styledIcons = Object.keys(
      defaultStyles
    ) as Array<DefaultExtensionType>;
    return styledIcons.find(
      (key) => key.toString() === extension.replace(".", "").toLowerCase()
    );
  };

  const loadData = () => {
    loadUserFiles();
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const getHumanReadableRelativeDate = (absoluteDate: Date): string => {
    const ago = require("s-ago");
    return ago(absoluteDate);
  };

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
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell>Size</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userFiles.map((userFile: IUserFile) => (
                <TableRow key={userFile.id}>
                  <TableCell collapsing>
                    <Checkbox
                      id={userFile.id}
                      onChange={(_event, data) =>
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
                    <a href="#" onClick={() => handleDownloadClick(userFile)}>
                      {userFile.name}
                    </a>
                  </TableCell>
                  <TableCell>
                    {getHumanReadableRelativeDate(userFile.createdDate)}
                  </TableCell>
                  <TableCell>{prettyBytes(userFile.size)}</TableCell>
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
