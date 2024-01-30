export interface IUserFile {
  id: string;
  name: string;
  type: string;
  created: string;
  createdDate: Date;
  thumbnail: string;
}

export class UserFile implements IUserFile {
  id: string;
  name: string;
  type: string;
  created: string;
  createdDate: Date;
  thumbnail: string;

  constructor(
    id: string,
    name: string,
    type: string,
    created: string,
    thumbnail: string
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.created = created;
    this.createdDate = new Date(created);
    this.thumbnail = thumbnail;
  }
}
