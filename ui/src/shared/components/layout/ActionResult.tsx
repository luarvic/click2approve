import { Pages } from "@/shared/components/layout/pageStyles";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Container } from "@mui/material";
import type { ReactNode } from "react";

interface ActionResultProps {
  title: string;
  message: string;
  action?: ReactNode;
}

const ActionResult = ({ message, title, action }: ActionResultProps) => (
  <Container maxWidth={Pages.centeredMessageMaxWidth} sx={Pages.centeredStateSx}>
    <PageBreadcrumbs align="center" items={[{ label: title }]} subtitle={message} />
    {action}
  </Container>
);

export default ActionResult;
