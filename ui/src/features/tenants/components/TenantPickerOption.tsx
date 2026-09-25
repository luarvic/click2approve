import { Tenant } from "@/features/tenants/models/tenant";
import { Flex } from "@/shared/components/layout/flexStyles";
import { Box, Typography } from "@mui/material";

interface TenantPickerOptionProps {
  employeeDisplayName?: string;
  tenant: Tenant;
}

const TenantPickerOption: React.FC<TenantPickerOptionProps> = ({ employeeDisplayName, tenant }) => (
  <Box sx={Flex.minWidthZeroSx}>
    <Typography noWrap variant="body1">
      {tenant.businessName}
      {employeeDisplayName && (
        <Typography component="span" variant="body1" color="text.secondary">
          {` • ${employeeDisplayName}`}
        </Typography>
      )}
    </Typography>
  </Box>
);

export default TenantPickerOption;
