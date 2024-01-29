import axios from "axios";
import { IUserFile } from "../models/UserFile";

const API_URI = process.env.REACT_APP_API_URI;

export async function getUserFiles(): Promise<IUserFile[]> {
  const { data } = await axios.get<IUserFile[]>(
    `${API_URI}/file`
  );
  return data;
}
