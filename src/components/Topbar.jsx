import { Leaf } from './icons.jsx';

const LINKS = [
  // Pages pas encore construites : chacune mène à sa 404 (dossiers farm/, gear/…)
  { label: 'Farm', href: './farm/' },
  { label: 'Gear', href: './gear/' },
  { label: 'Chapters', href: './chapters/' },
  { label: 'Our Crew', href: './crew/' },
];

export default function Topbar() {
  return (
    <header className="topbar">
      <a className="logo anim" data-enter="drop" href="#" aria-label="Quentin.C home">
        <Leaf />
        Quentin.C
      </a>
      <nav className="nav glass anim" data-enter="drop" aria-label="Main">
        {LINKS.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}
      </nav>
      <a className="pill white join-top anim" data-enter="drop" href="#">Join us</a>
    </header>
  );
}
