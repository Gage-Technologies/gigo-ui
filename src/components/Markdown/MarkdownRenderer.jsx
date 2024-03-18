import React, {useCallback, useEffect, useState} from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {defaultSchema} from 'rehype-sanitize';
import remarkCodeBlock from 'remark-code-blocks';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {darkSyntaxTheme, lightSyntaxTheme} from './SyntaxHighlights';
import {alpha, createTheme, IconButton, Tooltip} from '@mui/material';
import {getAllTokens} from '../../theme';
import merge from 'deepmerge';
import {Check, ContentCopy} from "@mui/icons-material";
import {styled} from "@mui/material/styles";
import {visit} from 'unist-util-visit';
import config from "../../config";
import "./css/MarkdownRenderer.css";

const syntaxHighlightingSchema = merge(defaultSchema, {
  attributes: {
    code: [...(defaultSchema.attributes.code || []), 'class'],
  },
});

const MarkdownRenderer = ({markdown, style, onAllMediaLoaded, imgProxy}) => {
  let userPref = localStorage.getItem('theme');
  const [mode, _] = useState(userPref === 'light' ? 'light' : 'dark');
  const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

  const CopyCode = styled('code')(() => ({
    cursor: 'pointer',

    // hightlight on hover
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.25),
    },

    // hightlight on click
    '&:active': {
      backgroundColor: alpha(theme.palette.primary.main, 0.5),
    }
  }));

  const [copied, setCopied] = useState(null);
  const [mediaCount, setMediaCount] = useState(0);
  const [loadedMediaCount, setLoadedMediaCount] = useState(0);

  useEffect(() => {
    if (mode === 'light') {
      require('./css/github-markdown-light.css');
    } else {
      require('./css/github-markdown-dark.css');
    }
  }, [mode]);

  useEffect(() => {
    if (mediaCount === loadedMediaCount && mediaCount > 0) {
      onAllMediaLoaded(); // This function can be used to measure height
    }
  }, [mediaCount, loadedMediaCount, onAllMediaLoaded]);

  useEffect(() => {
    // Reset counters when new markdown is received
    setLoadedMediaCount(0);
    // Use regex to count number of images in markdown and HTML
    const markdownImageRegex = /!\[[^\]]*\]\([^)]+\)/g;
    const htmlImageRegex = /<img [^>]*src="[^"]*"[^>]*>/g;
    // User regex to count number of videos in markdown and HTML
    const htmlVideoRegex = /<video [^>]*src="[^"]*"[^>]*>/g;

    const markdownMatches = markdown.match(markdownImageRegex) || [];
    const htmlMatches = markdown.match(htmlImageRegex) || [];
    const htmlVideoMatches = markdown.match(htmlVideoRegex) || [];

    setMediaCount(markdownMatches.length + htmlMatches.length + htmlVideoMatches.length);
  }, [markdown]);

  const handleMediaLoad = useCallback((x) => {
    setLoadedMediaCount(prevCount => prevCount + 1);
  }, []);

  function rehypeOnLoadPlugin() {
    return (tree) => {
      visit(tree, 'element', (node) => {
        if (node.tagName === 'img') {
          node.properties.id = "img:" + node.properties.src;
          node.properties.onLoad = () => {
            handleMediaLoad({target: node})
          };
          node.properties.loading = "lazy";
          if (config.imgCdnProxy && imgProxy) {
            node.properties.src = config.imgCdnProxy + imgProxy + node.properties.src;
          }
        }

        if (node.tagName === 'video') {
          // retrieve the first source in the children if it exists
          let src = "";
          if (node.children.length > 0) {
            src = node.children[0].properties.src;
          } else {
            src = node.properties.src;
          }
          node.properties.id = "video:" + src;

          node.properties.onLoadedData = () => {
            handleMediaLoad({target: node})
          };
          node.properties.loading = "lazy";
          node.properties.controls = false;
          node.properties.muted = true;
          node.properties.playsInline = true;
          node.properties.autoPlay = true;
          node.properties.loop = true;
        }
      });
    };
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
  };

  return (
    <div>
      <div className="markdown-body" style={style}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkCodeBlock]}
          rehypePlugins={[rehypeRaw, rehypeOnLoadPlugin, {settings: syntaxHighlightingSchema}]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              let t = String(children).replace(/\n$/, '');

              // return styled code
              if (!inline && match) {
                return (
                  <div style={{position: 'relative', marginRight: "18px"}}>
                    <Tooltip title={copied === t ? "Copied" : "Copy"} placement="top">
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: -14,
                          zIndex: 1,
                        }}
                        size="small"
                        onClick={() => copyToClipboard(t)}
                        color={copied === t ? 'success' : 'primary'}
                      >
                        {copied === t ? (
                          <Check sx={{height: 14, width: 14}}/>
                        ) : (
                          <ContentCopy sx={{height: 14, width: 14}}/>
                        )}
                      </IconButton>
                    </Tooltip>
                    <SyntaxHighlighter
                      children={String(children).replace(/\n$/, '')}
                      style={mode === 'light' ? lightSyntaxTheme : darkSyntaxTheme}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    />
                  </div>
                );
              }

              // return inline code
              return (
                <Tooltip title={copied === t ? "Copied" : "Click to copy"} placement="top">
                  <span
                    onClick={() => copyToClipboard(String(children))}
                  >
                    <CopyCode
                      onClick={() => copyToClipboard(String(children))}
                      className={className}
                      {...props}
                    >
                      {children}
                    </CopyCode>
                  </span>
                </Tooltip>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

MarkdownRenderer.defaultProps = {
  style: {
    overflowWrap: 'break-word',
    borderRadius: '10px',
    padding: '2em 3em',
    width: '85%',
  },
  onAllMediaLoaded: () => {
  },
  imgProxy: null,
};

export default MarkdownRenderer;
