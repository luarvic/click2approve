import InlineNotice from "@/shared/components/status/InlineNotice";
import { Link } from "@mui/material";

const CustomPlanNotice = () => (
  <InlineNotice severity="info">
    Need a custom plan?{" "}
    <Link color="inherit" href="mailto:contact@click2approve.com">
      Email us
    </Link>{" "}
    to discuss your requirements.
  </InlineNotice>
);

export default CustomPlanNotice;
