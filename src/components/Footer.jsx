import { Leaf } from './icons.jsx';

const INSTALL = [
  { os: 'macOS · Linux · WSL', lines: ['git clone https://github.com/Tokennn/ThemesTerm.git', 'cd ThemesTerm && ./install.sh'] },
  { os: 'Windows 11', lines: ['git clone https://github.com/Tokennn/ThemesTerm.git', 'ThemesTerm\\install.cmd'] },
];

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-intro" data-reveal="foot">
        <p className="display footer-kicker">THEME'STERM</p>
        <p className="footer-text">
          Two commands, then open any terminal: a classic shell, or live ASCII backdrops with
          a bouncy hello. Type <code>fond</code> any time to change the scene.
        </p>
      </div>

      <div className="footer-install">
        {INSTALL.map(({ os, lines }) => (
          <div className="shell" data-reveal="foot" key={os}>
            <div className="shell-bar"><i /><i /><i /><span>{os}</span></div>
            <pre>{lines.map(l => <span key={l}><b>➜</b> {l}{'\n'}</span>)}</pre>
          </div>
        ))}
      </div>

      <div className="footer-bottom" data-reveal="foot">
        <span className="footer-logo"><Leaf />Quentin.C</span>
        <span>© 2026 Quentin.C · ThemesTerm</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
