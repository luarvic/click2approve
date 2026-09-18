import { Box, type SxProps, type Theme } from "@mui/material";
import { Children, type ReactNode } from "react";

interface AuthTextLinksProps {
  children: ReactNode;
}

const getContainerSx = (linkCount: number): SxProps<Theme> => ({
  display: "grid",
  gridTemplateColumns: `repeat(${linkCount}, minmax(0, 1fr))`,
});

const getLinkSx = (index: number, linkCount: number): SxProps<Theme> => ({
  "& .MuiLink-root": { textAlign: "inherit" },
  minWidth: 0,
  textAlign: linkCount === 1 || (index === 1 && linkCount === 3) ? "center" : index === 0 ? "left" : "right",
  width: "100%",
});

/** Positions one to three secondary identity links in equal-width columns with contextual alignment. */
const AuthTextLinks = ({ children }: AuthTextLinksProps) => {
  const links = Children.toArray(children);
  return (
    <Box sx={getContainerSx(links.length)}>
      {links.map((link, index) => (
        <Box key={index} sx={getLinkSx(index, links.length)}>
          {link}
        </Box>
      ))}
    </Box>
  );
};

export default AuthTextLinks;
