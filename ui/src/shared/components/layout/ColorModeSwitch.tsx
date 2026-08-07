import { DarkMode, LightMode } from "@mui/icons-material";
import { styled, Switch, type SwitchProps } from "@mui/material";

const switchWidth = 62;
const switchHeight = 34;
const switchPadding = 7;
const switchBaseMargin = 1;
const switchBaseTranslateX = 6;
const checkedSwitchBaseTranslateX = 22;
const switchThumbSize = 32;
const switchIconSize = 20;
const switchTrackColor = "#aab4be";
const darkSwitchTrackColor = "#8796A5";
const switchThumbColor = "#f5f5f5";
const darkSwitchThumbColor = "#003892";
const sunIconColor = "#d4a72c";
const moonIconColor = "#fff8dc";

const SwitchIcon = styled("span")(({ theme }) => {
  const darkModeIsEnabled = theme.palette.mode === "dark";

  return {
    alignItems: "center",
    backgroundColor: darkModeIsEnabled ? darkSwitchThumbColor : switchThumbColor,
    borderRadius: "50%",
    color: darkModeIsEnabled ? moonIconColor : sunIconColor,
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
          backgroundColor: darkModeIsEnabled ? darkSwitchTrackColor : switchTrackColor,
          opacity: 1,
        },
      },
    },
    "& .MuiSwitch-track": {
      backgroundColor: darkModeIsEnabled ? darkSwitchTrackColor : switchTrackColor,
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
