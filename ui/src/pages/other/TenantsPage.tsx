import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import TenantsGrid from "../../components/grids/TenantsGrid";
import { PAGE_TITLE_SX } from "../../data/constants";
import { stores } from "../../stores/stores";

const TenantsPage = () => {
  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" />;
  }

  if (!stores.productStore.tenantsAreEnabled) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Typography component="h1" variant="h5" sx={PAGE_TITLE_SX}>
        Organizations
      </Typography>
      <TenantsGrid />
    </>
  );
};

export default observer(TenantsPage);
