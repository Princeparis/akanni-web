import React from 'react'
// @ts-ignore: allow side-effect CSS import without type declarations
import './MenuBtn.css'

interface MenuBtnProps {
  isOpen: boolean
  toggleMenu: () => void
}

const MenuBtn = ({ isOpen, toggleMenu }: MenuBtnProps): React.JSX.Element => {
  return (
    <div className={`menu-toggle ${isOpen ? 'opened' : 'closed'}`} onClick={toggleMenu}>
      <div className="menu-toggle-icon">
        <div className="menu-hamburger">
          <div className="menu-bar" data-position="top"></div>
          <div className="menu-bar" data-position="bottom"></div>
        </div>
      </div>
      <div className="menu-copy">
        <p>Menu</p>
      </div>
    </div>
  )
}

export default MenuBtn
