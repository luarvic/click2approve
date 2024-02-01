export interface IUserFile {
  id: string;
  name: string;
  type: string;
  created: string;
  createdDate: Date;
  thumbnail: string;
  checked: boolean;
}

export class UserFile implements IUserFile {
  id: string;
  name: string;
  type: string;
  created: string;
  createdDate: Date;
  thumbnail: string;
  checked: boolean;

  constructor(
    id: string,
    name: string,
    type: string,
    created: string,
    thumbnail: string,
    checked: boolean
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.created = created;
    this.createdDate = new Date(created);
    this.thumbnail = thumbnail;
    this.checked = checked;
  }
}
