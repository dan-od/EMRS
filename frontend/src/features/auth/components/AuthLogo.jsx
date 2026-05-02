export const AuthLogo = ({ className }) => (
  <div className={`flex flex-col items-center ${className || ''}`}>
    <div className="border-[1.5px] border-[#FF6B00] p-1.5 w-full max-w-[240px] sm:max-w-[280px]">
      <div className="flex flex-col w-full">
        <div className="py-1.5 sm:py-2 flex justify-center bg-white dark:bg-transparent">
          <span
            className="text-[#FF6B00] font-[800] text-lg sm:text-xl tracking-[0.12em] sm:tracking-[0.15em] leading-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            WELL FLUID
          </span>
        </div>
        <div className="bg-[#8B4513] py-1.5 sm:py-2 flex justify-center">
          <span
            className="text-white font-[500] text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.25em] leading-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            SERVICES LIMITED
          </span>
        </div>
      </div>
    </div>
  </div>
);
