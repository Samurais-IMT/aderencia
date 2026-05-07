const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-center">
          <p className="text-sm font-bold text-muted-foreground" style={{ fontSize: '14px' }}>
            Todas as áreas conectadas. Um único sistema. Um só objetivo.
          </p>
        </div>
        <div className="flex items-center">
          <img
            src="/megazord.svg"
            alt="Megazord"
            className="h-16 w-auto"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
