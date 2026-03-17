import smashLogo from '../assets/smash-logo.png';

export function SmashLogo({ className = "" }: { className?: string }) {
  return (
    <a 
      href="https://www.smashproperty.com.au/" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center ${className}`} 
      aria-label="Smash Property"
    >
      <img 
        src={smashLogo} 
        alt="Smash Property" 
        className="h-12 sm:h-14 w-auto"
      />
    </a>
  );
}
