import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect } from 'react';
import { DefaultExtensionType, FileIcon, defaultStyles } from 'react-file-icon';
import { Checkbox, Grid, Image, Popup, PopupContent, PopupHeader, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'semantic-ui-react';
import { IUserFile } from '../models/UserFile';
import { userFileStoreContext } from '../stores/UserFileStore';

const API_URI = process.env.REACT_APP_API_URI;

export const UserFiles = () => {
  const userFileStore = useContext(userFileStoreContext);
  const { userFiles, loadUserFiles } = userFileStore;

  const getDefaultExtensionType = (extention: string) => {
    const styledIcons = Object.keys(defaultStyles) as Array<DefaultExtensionType>;
    return styledIcons.find(key => key.toString() === extention.replace('.', '').toLowerCase());
  }

  const loadData = () => {
    loadUserFiles();
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <Grid centered columns={1}>
      <Grid.Column>
        <Table celled compact definition>
          <TableHeader fullWidth>
            <TableRow>
              <TableHeaderCell></TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Preview</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userFiles.map((userFile: IUserFile) => (
              <TableRow key={userFile.id}>
                <TableCell collapsing><Checkbox /></TableCell>
                <TableCell>
                  <div className='icon'>
                    {getDefaultExtensionType(userFile.type) ?
                        <FileIcon extension={userFile.type} {...defaultStyles[getDefaultExtensionType(userFile.type)!]} /> :
                        userFile.type}
                  </div>
                </TableCell>
                <TableCell><a href={`${API_URI}/download?id=${userFile.id}`} download>{userFile.name}</a></TableCell>
                <TableCell>{userFile.createdDate.toLocaleString()}</TableCell>
                <TableCell>
                  <Popup trigger={
                    <Image src={`${API_URI}/download?id=${userFile.id}&preview=true`} rounded size='mini' />
                  } wide>
                    <PopupContent>
                      <Image src={`${API_URI}/download?id=${userFile.id}&preview=true`} />
                    </PopupContent>
                  </Popup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid.Column>
    </Grid>
  )
}

export default observer(UserFiles);
