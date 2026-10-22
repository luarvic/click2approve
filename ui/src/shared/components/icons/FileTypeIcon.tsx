import {
  Archive,
  Article,
  AudioFile,
  Code,
  Image,
  InsertDriveFile,
  PictureAsPdf,
  Slideshow,
  TableChart,
  TextSnippet,
  VideoFile,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material";

interface FileTypeIconProps extends SvgIconProps {
  fileName: string;
}

const fileIconsByExtension: Record<string, SvgIconComponent> = {
  "7z": Archive,
  aac: AudioFile,
  avi: VideoFile,
  bmp: Image,
  c: Code,
  cpp: Code,
  css: Code,
  csv: TableChart,
  doc: Article,
  docx: Article,
  flac: AudioFile,
  gif: Image,
  go: Code,
  gz: Archive,
  h: Code,
  html: Code,
  java: Code,
  jpeg: Image,
  jpg: Image,
  js: Code,
  json: Code,
  m4a: AudioFile,
  md: TextSnippet,
  mov: VideoFile,
  mp3: AudioFile,
  mp4: VideoFile,
  mpeg: VideoFile,
  mpg: VideoFile,
  ods: TableChart,
  odt: Article,
  ogg: AudioFile,
  pdf: PictureAsPdf,
  png: Image,
  ppt: Slideshow,
  pptx: Slideshow,
  py: Code,
  rar: Archive,
  rs: Code,
  rtf: Article,
  sh: Code,
  tar: Archive,
  ts: Code,
  tsx: Code,
  txt: TextSnippet,
  wav: AudioFile,
  webm: VideoFile,
  webp: Image,
  xls: TableChart,
  xlsx: TableChart,
  xml: Code,
  yaml: Code,
  yml: Code,
  zip: Archive,
};

const getFileExtension = (fileName: string) => {
  const lastPeriodIndex = fileName.lastIndexOf(".");
  return lastPeriodIndex < 0 ? "" : fileName.slice(lastPeriodIndex + 1).toLowerCase();
};

const FileTypeIcon: React.FC<FileTypeIconProps> = ({ fileName, ...props }) => {
  const Icon = fileIconsByExtension[getFileExtension(fileName)] ?? InsertDriveFile;
  return <Icon {...props} />;
};

export default FileTypeIcon;
