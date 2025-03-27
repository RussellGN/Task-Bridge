type SpinnerProps = {
   size?: "sm" | "md" | "lg";
   color?: string;
};

export default function Spinner({ size = "md", color = "grey" }: SpinnerProps) {
   return (
      <div
         className={`spinner-border animate-spin inline-block rounded-full border-2 border-t-transparent mr-2 ${
            size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8"
         }`}
         style={{ borderColor: `${color} transparent transparent transparent` }}
      ></div>
   );
}
