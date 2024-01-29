import React, { useRef } from 'react'
import { Button, Icon, Menu, MenuItem } from 'semantic-ui-react'
import { uploadFiles } from '../utils/ApiClient';

export const NavBar = () => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget) {
      const filesUploaded = event.currentTarget.files;
      if (filesUploaded) {
        uploadFiles(filesUploaded);
      }
    }
  }

  return (
    <Menu>
      <MenuItem>
        <Button primary onClick={handleClick}>
          <Icon name='upload' />
          Upload
        </Button>
        <input type='file' multiple onChange={handleChange} ref={hiddenFileInput} style={{ display: 'none' }} />
      </MenuItem>
      <MenuItem>
        <Button>
          <Icon name='download' />
          Download
        </Button>
      </MenuItem>
      <MenuItem position='right'>
        <Button>
          <Icon name='sign-in' />
          Sign in
        </Button>
      </MenuItem>
    </Menu>
  )
}

export default NavBar
