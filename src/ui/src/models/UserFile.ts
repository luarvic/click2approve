export interface IUserFile {
  id: string;
  name: string;
  type: string;
  created: string;
  createdDate: Date;
  checked: boolean;
  downloadCount: number;
}

export class UserFile implements IUserFile {
  id: string;
  name: string;
  type: string;
  created: string;
  createdDate: Date;
  checked: boolean;
  downloadCount: number;

  constructor(
    id: string,
    name: string,
    type: string,
    created: string,
    checked: boolean,
    downloadCount: number
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.created = created;
    this.createdDate = new Date(created);
    this.checked = checked;
    this.downloadCount = downloadCount;
  }
}
