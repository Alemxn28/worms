const Button = ({ children, onClick, className,type}) => {
  const baseClasses = "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded";
  const buttonClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <button type={type}className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
