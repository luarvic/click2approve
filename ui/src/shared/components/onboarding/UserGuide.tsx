import { stores } from "@/app/rootStore";
import UserGuideTour from "@/shared/components/onboarding/UserGuideTour";
import { AppBarOptions } from "@/shared/models/appBarOptions";
import { isUserGuideDismissed } from "@/shared/session/session";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const UserGuide = ({ appBarOptions }: { appBarOptions: AppBarOptions }) => {
  const email = stores.userAccountStore.currentUser?.email;
  const ready =
    Boolean(email) &&
    stores.tenantStore.hasLoaded &&
    !stores.userAccountStore.passkeyEnrollmentPending &&
    appBarOptions.showMainMenuButton !== false &&
    appBarOptions.showProfileButton !== false;
  const showWorkspace =
    appBarOptions.showTenantPicker !== false &&
    stores.applicationConfigurationStore.tenantsAreEnabled &&
    stores.tenantStore.tenants.length > 0;

  useEffect(() => {
    if (ready && email && !isUserGuideDismissed(email)) stores.commonStore.setUserGuideIsOpen(true);
  }, [email, ready]);

  return ready && email && stores.commonStore.userGuideIsOpen ? (
    <UserGuideTour key={email} email={email} showWorkspace={showWorkspace} />
  ) : null;
};

export default observer(UserGuide);
