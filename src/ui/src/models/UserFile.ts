export interface IUserFile {
    id: string;
    name: string;
    type: string;
    created: Date;
}

export class UserFile implements IUserFile {
    id: string;
    name: string;
    type: string;
    created: Date;

    constructor(
        id: string,
        name: string,
        type: string,
        created: Date
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.created = created;
    }
}
