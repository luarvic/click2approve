import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect } from 'react';
import { Checkbox, Grid, Image, Popup, PopupContent, PopupHeader, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'semantic-ui-react';
import { IUserFile } from '../models/UserFile';
import { userFileStoreContext } from '../stores/UserFileStore';

const API_URI = process.env.REACT_APP_API_URI;

export const UserFiles = () => {
  const userFileStore = useContext(userFileStoreContext);
  const { userFiles, loadUserFiles } = userFileStore;

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
                <TableCell>{userFile.type}</TableCell>
                <TableCell>{userFile.name}</TableCell>
                <TableCell>{userFile.created.toLocaleString()}</TableCell>
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
