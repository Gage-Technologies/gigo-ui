import React from 'react';

interface TopbarProps {
    children: React.ReactNode;
}

function Topbar({children}: TopbarProps) {
    //className="flex flex-row bg-zinc-800 w-screen h-8 text-white text-sm"

    return (
        <div style={{display: "flex", flexDirection: "row"}}>
            {children}
        </div>
    );
}

export default Topbar;