import logoImage from 'figma:asset/973d40a9fb6437d871c3d69d0e9b66f96d7dea7c.png';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img src={logoImage} alt="EIC School" className="h-12 w-auto" />
    </div>
  );
}