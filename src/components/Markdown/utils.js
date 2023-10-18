import {getHighlighter} from 'shiki'
import darkTheme from 'shiki/themes/material-darker.json'
import lightTheme from 'shiki/themes/material-lighter.json'

export const createShikiFormatter = async (mode) => {
  try {

    let theme = mode === "light" ? lightTheme : darkTheme
    return await getHighlighter({
      theme: theme,
    })
  } catch (e) {
    console.error("failed to create shiki renderer: ", e)
  }
}