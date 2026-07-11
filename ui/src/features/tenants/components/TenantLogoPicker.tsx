import * as tenantApi from "@/features/tenants/api/tenantApi";
import { Files, Flex, StackSpacing } from "@/shared/constants/constants";
import { AddAPhoto, Business, DeleteOutline } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { ChangeEvent, useEffect, useRef, useState } from "react";

interface TenantLogoPickerProps {
  disabled?: boolean;
  logoUrl?: string;
  selectedFile: File | null;
  onSelect: (file: File | null) => void;
  onRemove: () => void;
}

const LOGO_PICKER_SIZE = 96;

const logoPickerContainerSx: SxProps<Theme> = {
  position: "relative",
  width: LOGO_PICKER_SIZE,
};

const logoPickerAvatarSx: SxProps<Theme> = {
  bgcolor: "action.selected",
  color: "text.secondary",
  height: LOGO_PICKER_SIZE,
  width: LOGO_PICKER_SIZE,
};

const logoPickerChangeButtonSx: SxProps<Theme> = {
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

const TenantLogoPicker: React.FC<TenantLogoPickerProps> = ({
  logoUrl,
  selectedFile,
  disabled,
  onSelect,
  onRemove,
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let isCurrent = true;

    const loadPreview = async () => {
      if (selectedFile) {
        objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return;
      }

      if (!logoUrl) {
        setPreviewUrl(undefined);
        return;
      }

      const blob = await tenantApi.downloadTenantLogo(logoUrl);
      if (!blob || !isCurrent) {
        return;
      }

      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    };

    loadPreview();

    return () => {
      isCurrent = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [logoUrl, selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    onSelect(file);
  };

  return (
    <Stack direction="row" spacing={StackSpacing.loose} alignItems="center">
      <Box sx={logoPickerContainerSx}>
        <Avatar
          src={previewUrl}
          alt="Organization logo"
          sx={logoPickerAvatarSx}
        >
          <Business fontSize="large" />
        </Avatar>
        <Tooltip title="Change logo">
          <IconButton
            aria-label="Change logo"
            disabled={disabled}
            size="small"
            onClick={() => fileInput.current?.click()}
            sx={logoPickerChangeButtonSx}
          >
            <AddAPhoto fontSize="small" />
          </IconButton>
        </Tooltip>
        <input
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInput}
          style={Files.inputStyle}
          type="file"
        />
      </Box>
      <Stack spacing={StackSpacing.tight} sx={Flex.minWidthZeroSx}>
        <Typography variant="subtitle2">Logo</Typography>
        <Box>
          <Tooltip title="Remove logo">
            <span>
              <IconButton
                aria-label="Remove logo"
                disabled={disabled || (!logoUrl && !selectedFile)}
                onClick={onRemove}
                size="small"
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Stack>
    </Stack>
  );
};

export default TenantLogoPicker;
