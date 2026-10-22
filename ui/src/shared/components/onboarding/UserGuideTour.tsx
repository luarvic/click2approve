import { stores } from "@/app/rootStore";
import { TenantType } from "@/features/tenants/models/tenant";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import CardHeading from "@/shared/components/papers/CardHeading";
import { dismissUserGuide } from "@/shared/session/session";
import { SurfaceTokens } from "@/shared/theme/tokens";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Popover,
  Portal,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLayoutEffect, useState } from "react";

const viewportMargin = 16;
const paperSx: SxProps<Theme> = {
  width: 360,
  maxWidth: "calc(100vw - 32px)",
  display: "flex",
  flexDirection: "column",
  border: 1,
  borderColor: "divider",
  borderRadius: SurfaceTokens.borderRadius,
  backgroundImage: "none",
  boxShadow: "none",
};
const positionedPaperSx = (top: number): SxProps<Theme> => ({
  ...paperSx,
  maxHeight: `calc(100dvh - ${top + viewportMargin}px)`,
});
const instructionsSx: SxProps<Theme> = {
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: -2,
  },
};
const progressSx: SxProps<Theme> = { display: "block", mb: 1 };
const groupSx: SxProps<Theme> = { mt: 2 };
const spotlightGap = 4;
const expandRadius = (radius: string): string =>
  radius
    .split(" ")
    .map((value) => (parseFloat(value) > 0 && !value.endsWith("%") ? `calc(${value} + ${spotlightGap}px)` : value))
    .join(" ");

const spotlightSx = (rect: DOMRect, style: CSSStyleDeclaration): SxProps<Theme> => ({
  position: "fixed",
  top: rect.top - spotlightGap,
  left: rect.left - spotlightGap,
  width: rect.width + spotlightGap * 2,
  height: rect.height + spotlightGap * 2,
  borderTopLeftRadius: expandRadius(style.borderTopLeftRadius),
  borderTopRightRadius: expandRadius(style.borderTopRightRadius),
  borderBottomLeftRadius: expandRadius(style.borderBottomLeftRadius),
  borderBottomRightRadius: expandRadius(style.borderBottomRightRadius),
  outline: "2px solid",
  outlineColor: "primary.main",
  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
  pointerEvents: "none",
  zIndex: (theme) => theme.zIndex.modal,
});
const popoverSx: SxProps<Theme> = { zIndex: (theme) => theme.zIndex.modal + 1 };

const groupDescriptions: Record<string, string> = {
  Work: "Requests, tasks, receipts, and templates when available.",
  Access: "Create and manage organizations.",
  People: "Employees, teams, and delegations, based on your role.",
  Subscription: "Plans, token usage, and data retention.",
  Support: "Docs, help, bug reports, and this guide.",
};

interface GuideStep {
  target: string;
  title: string;
  description: string;
}

const UserGuideTour = ({ email, showWorkspace }: { email: string; showWorkspace: boolean }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const menuIsOpen = stores.commonStore.mainMenuDrawerIsOpen;
  const showOrganizationHint =
    stores.applicationConfigurationStore.tenantsAreEnabled &&
    stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const [stepIndex, setStepIndex] = useState(0);
  const [highlight, setHighlight] = useState<{ rect: DOMRect; sx: SxProps<Theme> } | null>(null);
  const rect = highlight?.rect ?? null;
  const steps: GuideStep[] = [
    {
      target: "profile",
      title: "Your profile and settings",
      description:
        "Open your avatar, then select your account to update your personal details, default signature, security, and notification preferences.",
    },
    {
      target: "notifications",
      title: "Stay up to date",
      description:
        "The bell opens notifications for the selected workspace. Its badge shows unread updates. Open a notification to view the related work.",
    },
    ...(showWorkspace
      ? [
          {
            target: "workspace",
            title: "Choose your workspace",
            description:
              "Personal contains your own requests and tasks sent to your email address. Select an organization for its work. If you have delegated access, select the represented employee’s entry to work on their behalf.",
          },
        ]
      : []),
    {
      target: "menu",
      title: "Find your way around",
      description: "Find your work and settings in these menu groups.",
    },
  ];
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const isLastStep = step === steps[steps.length - 1];
  const groups = [
    ...new Set(
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-user-guide-group]"),
        (element) => element.dataset.userGuideGroup!,
      ),
    ),
  ];

  useLayoutEffect(() => {
    const measure = () => {
      const menuIsVisible = isDesktop && menuIsOpen;
      const target = step.target === "menu" && !menuIsVisible ? "menu-button" : step.target;
      const selector =
        target === "menu"
          ? '[data-user-guide="menu"] .MuiDrawer-docked .MuiDrawer-paper'
          : target === "workspace"
            ? '[data-user-guide="workspace"] .MuiOutlinedInput-root'
            : `[data-user-guide="${target}"]`;
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) {
        setHighlight(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      setHighlight({ rect, sx: spotlightSx(rect, window.getComputedStyle(element)) });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("transitionend", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("transitionend", measure, true);
    };
  }, [isDesktop, menuIsOpen, step.target]);

  const close = () => {
    dismissUserGuide(email);
    stores.commonStore.setUserGuideIsOpen(false);
  };
  const menuIsHighlighted = step.target === "menu" && rect && rect.height > 100;
  const position = {
    top: menuIsHighlighted ? 96 : (rect?.bottom ?? 72) + 12,
    left: Math.max(
      16,
      Math.min(menuIsHighlighted ? rect.right + 16 : (rect?.right ?? 376) - 360, window.innerWidth - 376),
    ),
  };

  return (
    <>
      {highlight && (
        <Portal>
          <Box aria-hidden="true" sx={highlight.sx} />
        </Portal>
      )}
      <Popover
        open
        anchorReference="anchorPosition"
        anchorPosition={position}
        onClose={close}
        sx={popoverSx}
        slotProps={{
          paper: {
            sx: positionedPaperSx(position.top),
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": "user-guide-title",
            "aria-describedby": "user-guide-description",
            tabIndex: -1,
          },
        }}
      >
        <DialogTitle id="user-guide-title">{step.title}</DialogTitle>
        <DialogContent
          aria-label="User guide instructions"
          aria-live="polite"
          role="region"
          sx={instructionsSx}
          tabIndex={0}
        >
          <CardHeading component="span" sx={progressSx}>
            Step {stepIndex + 1} of {steps.length}
          </CardHeading>
          <Typography id="user-guide-description">{step.description}</Typography>
          {isLastStep &&
            groups.map((group) => (
              <Box key={group} sx={groupSx}>
                <Typography variant="overline" color="textSecondary">
                  {group}
                </Typography>
                <Typography>{groupDescriptions[group]}</Typography>
                {group === "Access" && showOrganizationHint && (
                  <Typography>
                    Organization workspaces also include People for employees, teams, and delegations.
                  </Typography>
                )}
              </Box>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Skip</Button>
          {stepIndex > 0 && <Button onClick={() => setStepIndex(stepIndex - 1)}>Back</Button>}
          <MainActionButton onClick={() => (isLastStep ? close() : setStepIndex(stepIndex + 1))}>
            {isLastStep ? "Finish" : "Next"}
          </MainActionButton>
        </DialogActions>
      </Popover>
    </>
  );
};

export default observer(UserGuideTour);
