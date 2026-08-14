import Cropper, { type Area } from "react-easy-crop";
import { AddAPhoto } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import type { SxProps } from "@mui/material";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Tooltip,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { ChangeEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react";

interface ImagePickerProps {
  alt: string;
  fallback: ReactNode;
  imageSize: number;
  imageUrl?: string;
  selectedFile: File | null;
  title: string;
  disabled?: boolean;
  onDelete: () => void | Promise<void>;
  onSave: (file: File) => void;
}

const PICKER_SIZE = 96;
const DEFAULT_IMAGE_SIZE = 256;
const CROP_AREA_HEIGHT = 360;
const CROP_ZOOM_MAX = 3;
const CROP_ZOOM_MIN = 1;
const CROP_ZOOM_STEP = 0.1;

const pickerSx: SxProps<Theme> = {
  bgcolor: "action.selected",
  color: "text.secondary",
  cursor: "pointer",
  height: PICKER_SIZE,
  width: PICKER_SIZE,
};

const pickerContainerSx: SxProps<Theme> = {
  position: "relative",
  width: PICKER_SIZE,
};

const pickerChangeButtonSx: SxProps<Theme> = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  bottom: 0,
  boxShadow: 1,
  position: "absolute",
  right: 0,
  "&:hover": {
    bgcolor: "background.paper",
  },
};

const cropAreaSx: SxProps<Theme> = {
  bgcolor: "grey.900",
  height: CROP_AREA_HEIGHT,
  position: "relative",
};

const zoomSliderSx: SxProps<Theme> = {
  mt: 2,
};

const createCroppedFile = async (imageSource: string, cropArea: Area, imageSize: number): Promise<File> => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSource;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The image could not be loaded."));
  });

  const canvas = document.createElement("canvas");
  const outputSize = imageSize > 0 ? imageSize : DEFAULT_IMAGE_SIZE;
  canvas.height = outputSize;
  canvas.width = outputSize;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The image could not be processed.");
  }

  context.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, outputSize, outputSize);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });
  if (!blob) {
    throw new Error("The image could not be processed.");
  }

  return new File([blob], "image.jpg", { type: "image/jpeg" });
};

const ImagePicker: React.FC<ImagePickerProps> = ({
  alt,
  fallback,
  imageSize,
  imageUrl,
  selectedFile,
  title,
  disabled = false,
  onDelete,
  onSave,
}) => {
  const dialogFileSource = useRef<string>();
  const dialogTrigger = useRef<HTMLElement>();
  const fileInput = useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [dialogImageSource, setDialogImageSource] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [zoom, setZoom] = useState(CROP_ZOOM_MIN);
  const imagePreviewUrl = selectedFile ? previewUrl : imageUrl;

  useEffect(() => {
    const loadPreview = () => {
      if (selectedFile) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }

      if (!imageUrl) {
        setPreviewUrl(undefined);
        return;
      }

      setPreviewUrl(imageUrl);
    };

    return loadPreview();
  }, [imageUrl, selectedFile]);

  useEffect(
    () => () => {
      if (dialogFileSource.current) {
        URL.revokeObjectURL(dialogFileSource.current);
      }
    },
    [],
  );

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(undefined);
    setZoom(CROP_ZOOM_MIN);
  };

  const openDialog = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }

    dialogTrigger.current = event.currentTarget;
    event.currentTarget.blur();
    resetCrop();
    setDialogImageSource(imagePreviewUrl);
    setIsOpen(true);
  };

  const restoreDialogTriggerFocus = () => {
    window.requestAnimationFrame(() => {
      dialogTrigger.current?.focus();
    });
  };

  const closeDialog = () => {
    if (dialogFileSource.current) {
      URL.revokeObjectURL(dialogFileSource.current);
      dialogFileSource.current = undefined;
    }
    setIsOpen(false);
    setDialogImageSource(undefined);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }

    resetCrop();
    if (dialogFileSource.current) {
      URL.revokeObjectURL(dialogFileSource.current);
    }
    dialogFileSource.current = URL.createObjectURL(file);
    setDialogImageSource(dialogFileSource.current);
  };

  const handleSave = async () => {
    if (!dialogImageSource || !croppedAreaPixels) {
      return;
    }

    setIsSaving(true);
    try {
      onSave(await createCroppedFile(dialogImageSource, croppedAreaPixels, imageSize));
      closeDialog();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await onDelete();
    closeDialog();
  };

  return (
    <>
      <Box sx={pickerContainerSx}>
        <Tooltip title={title}>
          <Avatar alt={alt} aria-label={title} onClick={openDialog} src={imagePreviewUrl} sx={pickerSx}>
            {fallback}
          </Avatar>
        </Tooltip>
        <Tooltip title={title}>
          <span>
            <IconButton
              aria-label={title}
              disabled={disabled}
              onClick={openDialog}
              size="small"
              sx={pickerChangeButtonSx}
            >
              <AddAPhoto fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={isOpen}
        onClose={closeDialog}
        TransitionProps={{ onExited: restoreDialogTriggerFocus }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>
          {dialogImageSource ? (
            <>
              <Box sx={cropAreaSx}>
                <Cropper
                  aspect={1}
                  crop={crop}
                  image={dialogImageSource}
                  onCropChange={setCrop}
                  onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                  onZoomChange={setZoom}
                  zoom={zoom}
                />
              </Box>
              <Slider
                aria-label="Zoom image"
                max={CROP_ZOOM_MAX}
                min={CROP_ZOOM_MIN}
                onChange={(_, value) => setZoom(value as number)}
                step={CROP_ZOOM_STEP}
                sx={zoomSliderSx}
                value={zoom}
              />
            </>
          ) : (
            <Box sx={cropAreaSx} />
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={isSaving} onClick={() => fileInput.current?.click()}>
            Choose file
          </Button>
          <Button color="error" disabled={isSaving || (!imageUrl && !selectedFile)} onClick={handleDelete}>
            Delete
          </Button>
          <Button disabled={isSaving} onClick={closeDialog}>
            Cancel
          </Button>
          <LoadingButton disabled={!dialogImageSource || !croppedAreaPixels} loading={isSaving} onClick={handleSave}>
            Save
          </LoadingButton>
        </DialogActions>
        <input
          accept="image/*"
          hidden
          name="image-picker-file"
          onChange={handleFileChange}
          ref={fileInput}
          type="file"
        />
      </Dialog>
    </>
  );
};

export default ImagePicker;
