export interface IUserFile {
  id: string;
  name: string;
  type: string;
  created: string;
  createdDate: Date;
}

export class UserFile implements IUserFile {
  id: string;
  name: string;
  type: string;
  created: string;
  createdDate: Date;

  constructor(id: string, name: string, type: string, created: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.created = created;
    this.createdDate = new Date(created);
  }
}
