/* global React, ReactDOM */

// Hero med videobakgrunn og modal-video (inspirert av referansen)
const Hero = () => {
  const [open, setOpen] = React.useState(false);
  return (
    React.createElement('section', { className: 'hero-video' },
      // Bakgrunnsvideo
      React.createElement('div', { className: 'hero-video-bg' },
        React.createElement('div', { className: 'overlay' }),
        React.createElement('video', {
          className: 'video', autoPlay: true, muted: true, loop: true, playsInline: true,
          src: 'https://cdn.coverr.co/videos/coverr-cybernetic-planet-7139/1080p.mp4'
        })
      ),
      // Innhold
      React.createElement('div', { className: 'container hero-wrap' },
        React.createElement('div', { className: 'hero-left' },
          React.createElement('h1', { className: 'h1' },
            'AI for Finance', React.createElement('br'),
            React.createElement('span', { className: 'colored' }, 'Complex decisions', React.createElement('br')),
            ' made simple'
          ),
          React.createElement('p', { className: 'lead white' },
            'Betaworks bygger og drifter AI‑drevne sanntidsprodukter med høy brukerengasjement. Vi er selskapet bak Tavl.'
          ),
          React.createElement('div', { className: 'cta' },
            React.createElement('a', { className: 'btn white', href: '#funksjoner' }, 'Explore Features'),
            React.createElement('a', { className: 'btn', href: 'mailto:hello@betaworks.no' }, 'Kontakt oss')
          )
        ),
        React.createElement('div', { className: 'hero-right' },
          React.createElement('div', { className: 'video-card card' },
            React.createElement('div', { className: 'video-card-text' },
              React.createElement('div', { className: 'up_txt' }, 'Watch the power of Betaworks'),
              React.createElement('div', { className: 'txt_modal' }, 'Alt du trenger å vite — på få minutter')
            ),
            React.createElement('button', { className: 'btn primary', onClick: () => setOpen(true) }, 'Watch Now')
          )
        )
      ),
      // Modal
      open && React.createElement('div', { className: 'modal' },
        React.createElement('div', { className: 'modal-backdrop', onClick: () => setOpen(false) }),
        React.createElement('div', { className: 'modal-inner' },
          React.createElement('button', { className: 'modal-close', onClick: () => setOpen(false), 'aria-label': 'Lukk' }, '×'),
          React.createElement('div', { className: 'modal-video' },
            React.createElement('iframe', {
              width: '100%', height: '100%',
              src: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
              title: 'Demo video', frameBorder: '0',
              allow: 'encrypted-media; picture-in-picture; autoplay', allowFullScreen: true
            })
          )
        )
      )
    )
  );
};

// Footer
const Footer = () => (
  React.createElement('footer', { className: 'container footer', id: 'contact' },
    React.createElement('div', null, '© ', new Date().getFullYear(), ' Betaworks AS'),
    React.createElement('div', null,
      React.createElement('a', { href: 'mailto:hello@betaworks.no', className: 'btn' }, 'hello@betaworks.no')
    )
  )
);

const App = () => (
  React.createElement('div', { className: 'page' },
    React.createElement('div', { className: 'mesh' }),
    React.createElement('div', { className: 'grow' }, React.createElement(Hero, null)),
    React.createElement(Footer, null)
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
