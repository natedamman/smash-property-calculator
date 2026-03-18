import smashLogo from '../assets/smash-logo.png';

export function SmashLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={smashLogo} 
        alt="Smash Property" 
        className="h-12 sm:h-14 w-auto"
      />
    </div>
  );
}
