import './Header.css'

// Site header component with navigation
function Header() {
    return (
      <header className="blog-header">
        <div className="header-content">
          <h1>The World Economy Development Blog</h1>
          {/* Main navigation */}
          <nav className="main-nav">
            <ul className="nav-list">
              <li className="nav-item"><a href="#home">Home</a></li>
              <li className="nav-item"><a href="#about">About</a></li>
            </ul>
          </nav>
        </div>
      </header>
    );
  }

export default Header;