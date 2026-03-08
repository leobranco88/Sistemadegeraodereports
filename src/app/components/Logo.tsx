import logoImage from '../../assets/eic-logo-transparente.png';
export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img src={logoImage} alt="EIC School" className="h-12 w-auto" />
    </div>
  );
}
