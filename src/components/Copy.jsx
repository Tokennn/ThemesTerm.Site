import { Play } from './icons.jsx';

export default function Copy() {
  return (
    <section className="copy">
      <p className="display kicker anim" data-enter="unblur">THEME'STERM</p>
      <h1 className="display headline">
        <span className="line anim" data-enter="spring">COMMAND</span>
        <span className="line anim" data-enter="spring">YOUR CHOICES</span>
      </h1>
      <p className="subline anim" data-enter="rise">
        {/* espace avant chaque <br> : sur téléphone les <br> sont masqués */}
        Open any terminal and pick your world:{' '}<br />
        a classic shell, or live ASCII backdrops with a{' '}<br />
        bouncy hello. Your command line, your choices.
      </p>
      <div className="buttons">
        <a className="pill white join-main anim" data-enter="rise" href="#">Join us</a>
        <a className="pill watch glass anim" data-enter="rise" href="#footer">
          <Play />
          Watch preview
        </a>
      </div>
    </section>
  );
}
