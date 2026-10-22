import { ColorModeSwitchTokens } from "@/shared/components/layout/colorModeSwitchTokens";
import { DarkMode, LightMode } from "@mui/icons-material";
import { Switch, styled, type SwitchProps } from "@mui/material";

const switchWidth = 62;
const switchHeight = 34;
const switchPadding = 7;
const switchBaseMargin = 1;
const switchBaseTranslateX = 6;
const checkedSwitchBaseTranslateX = 22;
const switchThumbSize = 32;
const switchIconSize = 20;
const SwitchIcon = styled("span")(({ theme }) => {
  const darkModeIsEnabled = theme.palette.mode === "dark";

  return {
    alignItems: "center",
    backgroundColor: darkModeIsEnabled ? ColorModeSwitchTokens.darkThumb : ColorModeSwitchTokens.lightThumb,
    borderRadius: "50%",
    color: darkModeIsEnabled ? ColorModeSwitchTokens.moonIcon : ColorModeSwitchTokens.sunIcon,
    display: "flex",
    height: switchThumbSize,
    justifyContent: "center",
    width: switchThumbSize,
    "& .MuiSvgIcon-root": {
      fontSize: switchIconSize,
    },
  };
});

const StyledColorModeSwitch = styled(Switch)(({ theme }) => {
  const darkModeIsEnabled = theme.palette.mode === "dark";

  return {
    height: switchHeight,
    padding: switchPadding,
    width: switchWidth,
    "& .MuiSwitch-switchBase": {
      margin: switchBaseMargin,
      padding: 0,
      transform: `translateX(${switchBaseTranslateX}px)`,
      "&.Mui-checked": {
        transform: `translateX(${checkedSwitchBaseTranslateX}px)`,
        "& + .MuiSwitch-track": {
          backgroundColor: darkModeIsEnabled ? ColorModeSwitchTokens.darkTrack : ColorModeSwitchTokens.lightTrack,
          opacity: 1,
        },
      },
    },
    "& .MuiSwitch-track": {
      backgroundColor: darkModeIsEnabled ? ColorModeSwitchTokens.darkTrack : ColorModeSwitchTokens.lightTrack,
      borderRadius: switchHeight / 2,
      opacity: 1,
    },
  };
});

const ColorModeSwitch = (props: SwitchProps) => (
  <StyledColorModeSwitch
    {...props}
    checkedIcon={
      <SwitchIcon>
        <DarkMode />
      </SwitchIcon>
    }
    icon={
      <SwitchIcon>
        <LightMode />
      </SwitchIcon>
    }
  />
);

export default ColorModeSwitch;
