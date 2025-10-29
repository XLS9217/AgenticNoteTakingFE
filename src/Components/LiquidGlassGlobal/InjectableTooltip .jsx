import React from 'react'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

export const InjectableTooltip = ({ id, text, place = 'right', children }) => {
    const tooltipId = id || `tip-${Math.random().toString(36).slice(2, 9)}`

    if (!children) {
        return <Tooltip id={tooltipId} place={place} clickable offset={10} />
    }

    return (
        <>
            {React.cloneElement(children, {
                'data-tooltip-id': tooltipId,
                'data-tooltip-content': text,
            })}
            <Tooltip id={tooltipId} place={place} clickable offset={10} />
        </>
    )
}
