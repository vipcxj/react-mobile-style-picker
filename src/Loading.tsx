import * as React from 'react';

export default (color: React.CSSProperties['color'] = '#aaa', borderColor: React.CSSProperties['borderColor'] = 'white') => () => (
    <div className="m-style-picker-spinner">
        <div className="rect1" style={{ backgroundColor: color, borderColor }}/>
        <div className="rect2" style={{ backgroundColor: color, borderColor }}/>
        <div className="rect3" style={{ backgroundColor: color, borderColor }}/>
        <div className="rect4" style={{ backgroundColor: color, borderColor }}/>
        <div className="rect5" style={{ backgroundColor: color, borderColor }}/>
    </div>
);
