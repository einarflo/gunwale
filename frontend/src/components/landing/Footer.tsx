import logo from '../../images/tavl-logo.png';

export default function Footer() {
  return (
    <footer className="border-t-2 border-gray-200 py-12 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-gray-600 md:flex-row">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tavl" className="h-6" />
          <p>© {new Date().getFullYear()} Betaworks. Alle rettigheter forbeholdt.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-blue-600 transition-colors">Personvern</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Vilkår</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Kontakt</a>
        </div>
      </div>
    </footer>
  );
}
