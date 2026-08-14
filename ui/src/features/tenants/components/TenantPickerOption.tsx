import { Tenant } from "@/features/tenants/models/tenant";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface TenantPickerOptionProps {
  employeeDisplayName?: string;
  tenant: Tenant;
}

const rootSx: SxProps<Theme> = { minWidth: 0 };

const TenantPickerOption: React.FC<TenantPickerOptionProps> = ({ employeeDisplayName, tenant }) => (
  <Box sx={rootSx}>
    <Typography noWrap variant="body1">
      {tenant.businessName}
      {employeeDisplayName && (
        <Typography color="text.secondary" component="span" variant="body1">
          {` • ${employeeDisplayName}`}
        </Typography>
      )}
    </Typography>
  </Box>
);

export default TenantPickerOption;
