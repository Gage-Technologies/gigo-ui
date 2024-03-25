import {styled} from "@mui/material/styles";
import {alpha, Tab, Tabs} from "@mui/material";
import {grey} from "@mui/material/colors";

export const EditorTabs = styled(Tabs)(({ theme }) => ({
    p: 0,
    m: 0,
    minHeight: 0,
}));

export const EditorTab = styled(Tab)(({ theme }) => ({
    fontSize: '0.7rem !important',
    padding: "2px 6px",
    marginRight: "4px",
    textTransform: 'none',
    minHeight: 0,
    minWidth: 0,
    borderRadius: "8px",
    color: alpha(theme.palette.text.primary, 0.6),
    fontWeight: theme.typography.fontWeightMedium,

    '&:hover': {
        backgroundColor: alpha(grey[800], theme.palette.mode === "light" ? 0.1 : 0.25),
        opacity: 1,
    },
    '&.Mui-selected': {
        backgroundColor: alpha(grey[800], theme.palette.mode === "light" ? 0.1 : 0.25),
        color: alpha(theme.palette.text.primary, 0.8),
    },
    '&.Mui-focusVisible': {
        backgroundColor: '#d1eaff',
    },
}));