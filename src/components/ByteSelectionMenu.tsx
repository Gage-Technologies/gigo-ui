import React from 'react';
import {Grid, List, ListItem, ListItemText, Paper} from '@mui/material';
import BytesCard from "./BytesCard";
import config from "../config";

interface Byte {
    id: string;
    name: string;
    content: string;
    bytesThumb: string;
}

interface ByteSelectionMenuProps {
    bytes: Byte[];
    onSelectByte: (id: string) => void;
    style?: React.CSSProperties;
}

const ByteSelectionMenu: React.FC<ByteSelectionMenuProps> = ({ bytes, onSelectByte }) => {
    console.log(bytes);
    return (
        <div style={{
            height: '80vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            borderRadius: '4px',
            padding: '20px',
            backgroundColor: 'transparent',
            boxSizing: 'border-box'
        }}>
            <List>
                {bytes.map((byte) => (
                    <ListItem key={byte.id} style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '7%'
                    }}>
                        <BytesCard
                            bytesId={byte.id}
                            bytesTitle={byte.name}
                            bytesThumb={config.rootPath + byte.bytesThumb}
                            onClick={() => onSelectByte(byte.id)}
                            style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            width="10vw"
                            height="20vh"
                            imageWidth="10vw"
                            imageHeight="15vh"
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default ByteSelectionMenu;