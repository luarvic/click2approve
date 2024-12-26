import { Badge, Box, Tab as MuiTab, Tabs } from "@mui/material";
import { observer } from "mobx-react-lite";
import { SyntheticEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tab } from "../../models/tab";
import { stores } from "../../stores/stores";

const NavigationTabs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    stores.approvalRequestTaskStore.loadNumberOfUncompletedTasks();
  }, []);

  const handleTabChange = (_event: SyntheticEvent, tab: Tab) => {
    if (stores.commonStore.currentTab !== tab) {
      stores.commonStore.setCurrentTab(tab);
      switch (tab) {
        case Tab.Files:
          navigate("/files");
          break;
        case Tab.Inbox:
          navigate("/inbox");
          break;
        case Tab.Archive:
          navigate("/archive");
          break;
        case Tab.Sent:
          navigate("/sent");
          break;
      }
    }
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={stores.commonStore.currentTab} onChange={handleTabChange}>
        <MuiTab label="Files" />
        <MuiTab
          label={
            <Badge
              badgeContent={
                stores.approvalRequestTaskStore.numberOfUncompletedTasks
              }
              color="error"
            >
              Inbox
            </Badge>
          }
        />
        <MuiTab label="Archive" />
        <MuiTab label="Sent" />
      </Tabs>
    </Box>
  );
};

export default observer(NavigationTabs);
